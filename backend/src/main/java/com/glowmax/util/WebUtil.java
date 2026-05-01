package com.glowmax.util;

import jakarta.servlet.http.HttpServletRequest;

public class WebUtil {
    public static String extractClientIp(HttpServletRequest request) {
        if (request.getHeader("X-Forwarded-For") != null) {
            return request.getHeader("X-Forwarded-For").split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
