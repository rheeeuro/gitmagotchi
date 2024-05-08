import uuid
import base64
import json
import logging
import boto3
import random

from botocore.exceptions import ClientError

# 필요한 설정 값을 설정하세요
S3_BUCKET = 'gitmagotchi-generated'  # S3 버킷 이름
AWS_REGION = 'us-east-1'  # 리전 정보

s3_client = boto3.client('s3', region_name=AWS_REGION)

# 배경색 리스트
colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'purple']

class ImageGenerationError(Exception):
    """Base class for exceptions in this module."""
    pass

class ImageError(ImageGenerationError):
    """Exception raised for errors during image generation."""
    def __init__(self, message="An error occurred during image generation"):
        self.message = message
        super().__init__(self.message)

class PolicyViolationError(ImageGenerationError):
    """Exception raised for policy violations."""
    def __init__(self, message="Your message violates the AI policy"):
        self.message = message
        super().__init__(self.message)


def generate_image(model_id, body):
    """
    Generate an image using Amazon Titan Image Generator G1 model on demand.
    Args:
        model_id (str): The model ID to use.
        body (str) : The request body to use.
    Returns:
        image_bytes (bytes): The image generated by the model.
    """
    try:
        print(f"Generating image with Amazon Titan Image Generator G1 model {model_id}")

        bedrock = boto3.client(service_name='bedrock-runtime')

        accept = "application/json"
        content_type = "application/json"
        response = bedrock.invoke_model(
            body=body, modelId=model_id, accept=accept, contentType=content_type
        )
        response_body = json.loads(response.get("body").read())    
            
        # 에러 관련 처리
        if response_body.get("error"):
            error_message = response_body["error"]
            if "policy violation" in error_message.lower():
                raise PolicyViolationError
            else:
                raise ImageError(f"Image generation error: {error_message}")

        base64_image = response_body.get("images")[0]
        base64_bytes = base64_image.encode('ascii')
        image_bytes = base64.b64decode(base64_bytes)

        print(f"Successfully generated image with Amazon Titan Image Generator G1 model {model_id}")

        # finish_reason = response_body.get("error")
        # if finish_reason is not None:
        #     raise ImageError(f"Image generation error. Error is {finish_reason}")    

        return image_bytes
    except PolicyViolationError as e:
        print(f"Policy violation: {e}")
        # 추가 처리 가능
        raise
    except ImageError as e:
        print(f"Image generation error: {e}")
        # 추가 처리 가능
        raise
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        # 예상치 못한 예외에 대한 처리
        raise

def upload_to_s3(image_bytes, bucket_name, file_name):
    """
    주어진 바이트 이미지를 S3 버킷에 업로드합니다.
    """
    try:
        s3_client.put_object(Bucket=bucket_name, Key=file_name, Body=image_bytes, ContentType='image/png')
        url = f"https://{bucket_name}.s3.{AWS_REGION}.amazonaws.com/{file_name}"
        return url
    except ClientError as e:
        logging.error(e)
        return None

def lambda_handler(event, context):
    json_body = event.get('body')
    
    print("Request:", event)
    print("Received body:", json_body)
    
    if not json_body:
        return {
            'statusCode': 400,
            'body': json.dumps('Invalid input data')
        }
        
    obj = json.loads(json_body)    
    user_input = obj.get("userInput")
    
    color = random.choice(colors)
    
    model_id = 'amazon.titan-image-generator-v1'
    prompt = f"""
    I don't want any text or characters in this picture.
    I'm going to create a wallpaper for a cute game.
    
    USER INPUT : {user_input}
    
    If there is no color in USER INPUT, Please make it {color}.
    Create a picture-like image, not a real picture, THAT FITS USER INPUT.
    Please always make a different image.
    """
    print("Prompt:", prompt)
    
    body = json.dumps({
        "taskType": "TEXT_IMAGE",
        "textToImageParams": {
            "text": prompt
        },
        "imageGenerationConfig": {
            "numberOfImages": 1,
            "height": 1024,
            "width": 1024,
            "cfgScale": 8.0,
            "seed": 0
        }
    })
    
    try:
        # 이미지 생성
        image_bytes = generate_image(model_id=model_id, body=body)
        
        # 생성된 이미지를 S3에 업로드하고 URL 받기
        file_name = f"image-{uuid.uuid4()}.png"  # 유니크한 파일 이름 생성
        image_url = upload_to_s3(image_bytes, S3_BUCKET, file_name)
        
        # S3 URL 리턴
        if image_url:
            return {
                'statusCode': 200,
                'body': json.dumps({"imageUrl": image_url}),
            }
        else:
            return {
                'statusCode': 500,
                'body': json.dumps({"error": "Failed to upload image to S3"}),
            }

    except (ClientError, ImageError) as err:
        logging.error("Error generating or uploading the image: %s", err)
        return {
            'statusCode': 500,
            'body': json.dumps({"error": str(err)})
        }
