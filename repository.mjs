import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const dynamoDBClient = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

export const createNotification = async (data) => {
  if (!data.title || !data.message) {
    throw new Error("Título e mensagem são obrigatórios");
  }

  const params = {
    TableName: "notification",
    Item: {
      notification_id: uuidv4(),
      created_at: new Date().toISOString(),
      title: data.title,
      message: data.message,
      deeplink: data.deeplink || null,
    },
  };

  if (data.establishmentId) {
    params.Item.establishment_id = data.establishmentId;
  }

  try {
    const command = new PutCommand(params);
    await docClient.send(command);
    console.log("Notificação criada com sucesso");
  } catch (error) {
    console.error("Erro ao criar notificação no DynamoDB", error);
    throw new Error("Falha ao criar notificação", error);
  }
};

export const getNotifications = async (date, establishmentId) => {
  if (!date) {
    throw new Error("A data para consulta é obrigatória");
  }

  const establishmentIdQuery = {
    TableName: "notification",
    IndexName: "establishment_id-created_at-index",
    KeyConditionExpression:
      "establishment_id = :establishment_id AND created_at > :created_at",
    ExpressionAttributeValues: {
      ":establishment_id": establishmentId,
      ":created_at": date,
    },
  };

  const allQuery = {
    TableName: "notification",
    FilterExpression:
      "attribute_not_exists(establishment_id) AND created_at > :created_at",
    ExpressionAttributeValues: {
      ":created_at": date,
    },
  };

  try {
    
    const commandId = new QueryCommand(establishmentIdQuery);
    const { Items } = await docClient.send(commandId);
    console.log("Establishment query", Items);

    const commandAll = new ScanCommand(allQuery);
    const AllItems = (await docClient.send(commandAll)).Items;
    console.log("all query", Items);

    const items = [...Items, ...AllItems];
    console.log("Notificações encontradas", items);
    return items;
  } catch (error) {
    console.error("Erro ao buscar notificações no DynamoDB", error);
    throw new Error("Falha ao buscar notificações", error);
  }
};
