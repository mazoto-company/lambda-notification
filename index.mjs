import { createNotification, getNotifications } from "./repository.mjs";

export const handler = async (event) => {
  const method = event.requestContext.http.method;
  

  if (method === "POST") {
    let body = {};
    body = JSON.parse(event.body);
    const title = body.title;
    const message = body.message;

    if (!title || !message) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Título e mensagem são obrigatórios" }),
      };
    }

    let response;
    try {
      response = await createNotification(body);
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Ocorreu um erro ao tentar criar a notificação",
          data: error,
        }),
      };
    }

    if (!response) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Ocorreu um erro ao tentar criar a notificação",
        }),
      };
    }
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    };
  } else if (method === "GET") {
    const establishmentId = event.queryStringParameters?.establishmentId;
    const date = event.queryStringParameters?.date;
    let response;
    try {
      response = await getNotifications(date, establishmentId);
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Ocorreu um erro ao tentar buscar as notificações",
          data: error,
        }),
      };
    }

    if (!response) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Notificações não encontradas" }),
      };
    }
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    };
  } else {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message:
          "Método não permitido ou nem todos os parâmetros necessários foram enviados",
      }),
    };
  }
};
