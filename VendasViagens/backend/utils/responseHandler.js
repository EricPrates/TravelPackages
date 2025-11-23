/**
 * Padronização de respostas da API
 * Todas as respostas seguem o formato:
 * {
 *   success: boolean,
 *   message: string (opcional),
 *   data: object (opcional),
 *   error: string (opcional)
 * }
 */

export const successResponse = (res, statusCode = 200, data = null, message = null) => {
    const response = {
        success: true
    };

    if (message) response.message = message;
    if (data) response.data = data;

    return res.status(statusCode).json(response);
};

export const errorResponse = (res, statusCode = 500, message = 'Erro interno do servidor', error = null) => {
    const response = {
        success: false,
        message
    };

    if (error && process.env.NODE_ENV === 'development') {
        response.error = error;
    }

    return res.status(statusCode).json(response);
};

// Respostas específicas comuns
export const notFoundResponse = (res, resource = 'Recurso') => {
    return errorResponse(res, 404, `${resource} não encontrado.`);
};

export const badRequestResponse = (res, message = 'Requisição inválida.') => {
    return errorResponse(res, 400, message);
};

export const unauthorizedResponse = (res, message = 'Não autorizado.') => {
    return errorResponse(res, 401, message);
};

export const forbiddenResponse = (res, message = 'Acesso negado.') => {
    return errorResponse(res, 403, message);
};

export const conflictResponse = (res, message = 'Conflito de dados.') => {
    return errorResponse(res, 409, message);
};

export const createdResponse = (res, data = null, message = 'Criado com sucesso.') => {
    return successResponse(res, 201, data, message);
};

export const noContentResponse = (res) => {
    return res.status(204).send();
};
