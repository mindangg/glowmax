package com.glowmax.config;

import com.glowmax.filter.JwtFilter;
import org.springframework.http.HttpMethod;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Security config — JWT-based stateless auth + CORS inline.
 *
 * Lean: gộp CORS vào đây thay vì file riêng (5 dòng config).
 *
 * Filter chain:
 *  1. CORS preflight (OPTIONS) pass-through
 *  2. CSRF disable (stateless)
 *  3. Session: STATELESS
 *  4. Public: /api/v1/auth/**, /api/v1/leaderboard, /actuator/health, /api/v1/profiles/check-username, /api/v1/analyze/trial
 *  5. Còn lại: require JWT valid
 *  6. JwtFilter chạy trước UsernamePasswordAuthenticationFilter
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Value("${glowmax.cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
          http.csrf(c -> c.disable())
              .cors(c -> c.configurationSource(corsSource()))
              .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
              .authorizeHttpRequests(a -> a
                  .requestMatchers("/api/v1/auth/**").permitAll()
                  .requestMatchers(HttpMethod.GET, "/api/v1/leaderboard", "/api/v1/leaderboard/search").permitAll()
                  .requestMatchers("/api/v1/profiles/check-username").permitAll()
                  .requestMatchers("/api/v1/analyze/trial").permitAll()
                  .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                  .anyRequest().authenticated())
              .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
              .headers(h -> h
                  .httpStrictTransportSecurity(hsts -> hsts.maxAgeInSeconds(31536000).includeSubDomains(true))
                  .frameOptions(f -> f.deny())
                  .contentTypeOptions(c -> {}));
          return http.build();
    }

    private CorsConfigurationSource corsSource() {
        CorsConfiguration cfg = new CorsConfiguration();
            cfg.setAllowedOriginPatterns(allowedOrigins);
            cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
            cfg.setAllowedHeaders(List.of("*"));
            cfg.setExposedHeaders(List.of("X-Rate-Limit-Retry-After"));
            cfg.setAllowCredentials(false);
            cfg.setMaxAge(3600L);
            UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
            src.registerCorsConfiguration("/**", cfg);
            return src;
    }
}
