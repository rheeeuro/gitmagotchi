package user.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import user.entity.User;

import javax.persistence.*;
import java.util.*;

public class RankMeHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final static EntityManagerFactory entityManagerFactory = Persistence.createEntityManagerFactory("myPersistenceUnit");
    private static final Gson gson = new Gson();

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        try {
            entityManager.getTransaction().begin();

            Map<String, String> queryParams = Optional.ofNullable(request.getQueryStringParameters()).orElse(Collections.emptyMap());
            String type = queryParams.getOrDefault("type", "BEST");
            String userId = queryParams.getOrDefault("userId", "");

            String queryStr;
            if ("BEST".equals(type)) {
                queryStr = "SELECT u.id, COUNT(u.id) as collection_count, RANK() OVER (ORDER BY COUNT(u.id) DESC) as user_rank " +
                        "FROM user u JOIN collection c ON c.user_id = u.id " +
                        "WHERE c.ending = 'INDEPENDENT'" +  // userId 파라미터 포함
                        "GROUP BY u.id";
            } else {
                queryStr = "SELECT u.id, COUNT(u.id) as collection_count, RANK() OVER (ORDER BY COUNT(u.id) DESC) as user_rank " +
                        "FROM user u JOIN collection c ON c.user_id = u.id " +
                        "WHERE c.ending IN ('SICK', 'RUNAWAY', 'HUNGRY')" +  // userId 파라미터 포함
                        "GROUP BY u.id";
            }
            Query rankQuery = entityManager.createNativeQuery(queryStr);
            List<Object[]> results = rankQuery.getResultList();

            entityManager.getTransaction().commit();
            entityManager.close();

            Map<String, Object> responseMap = new HashMap<>();
            Object[] selectedUser = null;
            for (Object[] result : results) {
                if (result[0].equals(userId)) {
                    selectedUser = result;
                    break;
                }
            }

            if (selectedUser != null) {
                responseMap.put("id", selectedUser[0]);
                responseMap.put("collection_count", selectedUser[1]);
                responseMap.put("rank", selectedUser[2]);
            } else {
                responseMap.put("message", "No data found for the provided user ID.");
            }

            String jsonResponse = gson.toJson(responseMap);
            APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
            response.setStatusCode(200);
            response.setBody(jsonResponse);

            return response;
        } finally {
            entityManager.close();
        }
    }
}
