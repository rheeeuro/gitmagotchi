import pymysql
import boto3
import json
from pymysql.err import OperationalError

# AWS Systems Manager (SSM) 클라이언트 생성
ssm = boto3.client('ssm', region_name='ap-northeast-2')

def get_parameter(name):
    """Parameter Store로부터 파라미터 값을 가져오는 함수"""
    try:
        response = ssm.get_parameter(
            Name=name,
            WithDecryption=True
        )
        return response['Parameter']['Value']
    except ssm.exceptions.ParameterNotFound:
        raise ValueError(f"Parameter {name} not found")

def init_db():    
    try:
        # 환경 변수로부터 파라미터 이름을 읽어옵니다.
        db_host = get_parameter('mysql-host')
        db_user = get_parameter('mysql-username')
        db_password = get_parameter('mysql-password')
        db_name = "gitmagotchi"
        
        # 데이터베이스에 연결
        return pymysql.connect(host=db_host, user=db_user, passwd=db_password, db=db_name)
    except OperationalError as e:
        print(f"Database connection failed: {e}")
        raise ValueError("Failed to connect to the database")
    except ValueError as e:
        raise e

def apply_stat(characterId, stat, conn):
    fullnessStat = stat.get("fullnessStat")
    intimacyStat = stat.get("intimacyStat")
    cleannessStat = stat.get("cleannessStat")
    unusedStat = stat.get("unusedStat")

    with conn.cursor() as cur:
        try:
            update_query = """
            UPDATE stat
            SET fullness_stat = %s, intimacy_stat = %s,
                cleanness_stat = %s, unused_stat = %s          
            WHERE character_id = %s;
            """            
            cur.execute(update_query, (fullnessStat, intimacyStat, cleannessStat, unusedStat, characterId))
        except Exception as e:
            print(f"An error occurred applying stat: {e}")

def apply_status(characterId, status, conn):
    fullness = status.get("fullness")
    intimacy = status.get("intimacy")
    cleanness = status.get("cleanness")

    with conn.cursor() as cur:
        try:
            update_query = """
            UPDATE `status`
            SET fullness = %s, intimacy = %s,
                cleanness = %s
            WHERE character_id = %s;
            """            
            cur.execute(update_query, (fullness, intimacy, cleanness, characterId))
        except Exception as e:
            print(f"An error occurred applying status: {e}")

def apply_character(userId, exp, stat, status):    
    conn = init_db()    
    with conn.cursor() as cur:
        try:
            # 캐릭터 Id 찾기
            select_query = """
            SELECT character_id FROM user WHERE id = %s;
            """
            cur.execute(select_query, (userId,))            
            characterId = cur.fetchone()
            
            update_query = """
            UPDATE `character`
            SET exp = %s, last_online = NOW()
            WHERE id = %s;
            """            
            cur.execute(update_query, (exp, characterId))
        except Exception as e:
            print(f"An error occurred applying character: {e}")
    apply_stat(characterId, stat, conn)
    apply_status(characterId, status, conn)
    conn.commit()

def lambda_handler(event, context):    
    try:
        json_body = event.get('body').get('body')
        # event로부터 사용자 정보를 추출합니다.
        obj = json.loads(json_body)

        userId = event.get('context').get('username').replace('github_', '')
        exp = obj.get("exp")
        status = obj.get("status")
        stat = obj.get("stat")

        apply_character(userId, exp, stat, status)

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Character apply successfully'})
        }
    except ValueError as e:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': str(e)})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }        