package com.glowmax.aspect;

import com.glowmax.annotation.RateLimit;
import com.glowmax.service.RateLimitService;
import com.glowmax.util.WebUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Duration;

/**
 * Intercept mọi method có @RateLimit → build key → delegate sang RateLimitService.
 *
 * KEY USER: keyPrefix + ":" + userId (getName() từ SecurityContext)
 * KEY IP:   keyPrefix + ":" + client IP (qua WebUtil.extractClientIp)
 */
@Aspect
@Component
@RequiredArgsConstructor
public class RateLimitAspect {

    private final RateLimitService rateLimitService;

    @Around("@annotation(rateLimit)")
    public Object enforce(ProceedingJoinPoint pjp, RateLimit rateLimit) throws Throwable {
        String key = buildKey(rateLimit);
        Duration window = Duration.of(rateLimit.window(), rateLimit.unit());
        rateLimitService.checkOrThrow(key, rateLimit.capacity(), window);
        return pjp.proceed();
    }

    private String buildKey(RateLimit rateLimit) {
        return switch (rateLimit.keyType()) {
            case USER -> {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                String userId = (auth != null && auth.isAuthenticated()) ? auth.getName() : "anonymous";
                yield rateLimit.keyPrefix() + ":" + userId;
            }
            case IP -> {
                ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                HttpServletRequest request = attrs.getRequest();
                yield rateLimit.keyPrefix() + ":" + WebUtil.extractClientIp(request);
            }
        };
    }
}
