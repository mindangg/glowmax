package com.glowmax.filter;

import com.glowmax.service.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JWT auth filter — chạy trước UsernamePasswordAuthenticationFilter.
 *
 * Logic:
 *  1. Extract Authorization: Bearer <token>
 *  2. Nếu null/invalid → continue chain (controller bị reject ở SecurityFilterChain config)
 *  3. Nếu valid → set Authentication vào SecurityContext
 *      → controller dùng @AuthenticationPrincipal hoặc Authentication.getName() lấy userId
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain chain) throws ServletException, IOException {
          String header = request.getHeader("Authorization");
          if (header != null && header.startsWith("Bearer ")) {
            try {
              JwtUtil.Claims claims = jwtUtil.parseAndValidate(header.substring(7));
              var authToken = new UsernamePasswordAuthenticationToken(
                  claims.userId().toString(),
                  null,
                  claims.isAnonymous()
                      ? List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS"))
                      : List.of(new SimpleGrantedAuthority("ROLE_USER"))
              );
              SecurityContextHolder.getContext().setAuthentication(authToken);
            }
            catch (Exception e) {
              log.debug("Invalid JWT: {}", e.getMessage());
            }
          }
        chain.doFilter(request, response);
    }
}
