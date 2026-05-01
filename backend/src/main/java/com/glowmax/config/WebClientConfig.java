package com.glowmax.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

/**
 * WebClient bean cho gọi OpenAI.
 */
@Configuration
public class WebClientConfig {

    @Value("${glowmax.openai.base-url}")
    private String openAiBaseUrl;

    @Value("${glowmax.openai.api-key}")
    private String openAiApiKey;

    @Value("${glowmax.openai.timeout-seconds}")
    private int timeoutSeconds;

    @Bean(name = "openAiWebClient")
    public WebClient openAiWebClient() {
       HttpClient httpClient = HttpClient.create().responseTimeout(Duration.ofSeconds(timeoutSeconds));
       return WebClient.builder()
               .baseUrl(openAiBaseUrl)
               .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + openAiApiKey)
               .clientConnector(new ReactorClientHttpConnector(httpClient))
               .codecs(c -> c.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
               .build();
    }
}
