package com.glowmax.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Domain-level exception. Throw từ service layer, GlobalExceptionHandler bắt và convert sang ProblemDetail JSON.
 *
 * Common error codes (gợi ý — không strict):
 *  - USERNAME_TAKEN (409)
 *  - PROFILE_NOT_FOUND (404)
 *  - SCORE_NOT_FOUND (404)
 *  - INVALID_OAUTH_TOKEN (401)
 *  - RATE_LIMIT (429)
 *  - FORBIDDEN (403)
 *  - OPENAI_FAILED (502)
 *  - S3_UPLOAD_FAILED (500)
 */
@Getter
public class BusinessException extends RuntimeException {
    private final HttpStatus status;
    private final String errorCode;

    public BusinessException(HttpStatus status, String errorCode, String message) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }

    public static BusinessException notFound(String code, String msg) {
        return new BusinessException(HttpStatus.NOT_FOUND, code, msg);
    }

    public static BusinessException conflict(String code, String msg) {
        return new BusinessException(HttpStatus.CONFLICT, code, msg);
    }

    public static BusinessException forbidden(String code, String msg) {
        return new BusinessException(HttpStatus.FORBIDDEN, code, msg);
    }

    public static BusinessException unauthorized(String code, String msg) {
        return new BusinessException(HttpStatus.UNAUTHORIZED, code, msg);
    }

    public static BusinessException badRequest(String code, String msg) {
        return new BusinessException(HttpStatus.BAD_REQUEST, code, msg);
    }

    public static BusinessException tooManyRequests(String code, String msg) {
        return new BusinessException(HttpStatus.TOO_MANY_REQUESTS, code, msg);
    }
}
