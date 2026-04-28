package com.glowmax.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

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
        // TODO:
        //  - baseUrl(openAiBaseUrl)
        //  - defaultHeader(AUTHORIZATION, "Bearer " + openAiApiKey)
        //  - clientConnector with HttpClient.responseTimeout(Duration.ofSeconds(timeoutSeconds))
        //  - codecs configurer: maxInMemorySize 10MB (cho large vision response)
        throw new UnsupportedOperationException("TODO");
    }
}
