package com.glowmax.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * OpenAI client — gọi GPT-4o vision API.
 *
 * Port từ supabase/functions/analyze-face/index.ts:
 *  - Endpoint: POST /chat/completions
 *  - Model: gpt-4o (configurable)
 *  - Image: data:image/jpeg;base64,<photo>
 *  - response_format: { "type": "json_object" }
 *  - System prompt: copy nguyên 250 dòng từ Supabase function
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OpenAiService {

    @Qualifier("openAiWebClient")
    private final WebClient openAiWebClient;

    @Value("${glowmax.openai.model}")
    private String model;

    /**
     * Analyze face photo. Returns raw JSON string (service caller parse).
     */
    public String analyzeFace(String photoBase64, String gender, int age) {
        // TODO: build request body
        //  Map.of(
        //    "model", model,
        //    "response_format", Map.of("type", "json_object"),
        //    "messages", List.of(
        //      Map.of("role", "system", "content", SYSTEM_PROMPT),
        //      Map.of("role", "user", "content", List.of(
        //        Map.of("type", "text", "text", "Gender: " + gender + ", Age: " + age),
        //        Map.of("type", "image_url", "image_url",
        //               Map.of("url", "data:image/jpeg;base64," + photoBase64))
        //      ))
        //    ),
        //    "temperature", 0.7,
        //    "max_tokens", 4096
        //  )
        //
        //  Map<?,?> response = openAiWebClient.post().uri("/chat/completions")
        //    .bodyValue(body)
        //    .retrieve()
        //    .bodyToMono(Map.class)
        //    .block();
        //
        //  Extract: response.choices[0].message.content
        //
        //  Error handling:
        //    - 401 → BusinessException OPENAI_AUTH_FAILED
        //    - 5xx → retry 1 lần với exponential backoff
        throw new UnsupportedOperationException("TODO");
    }

    /**
     * System prompt — TODO: copy từ supabase/functions/analyze-face/index.ts dòng ~50-300.
     * Định nghĩa: 7 PSL tiers, 9 result categories, output JSON schema, scoring rubric.
     */
    private static final String SYSTEM_PROMPT = """
            TODO: Copy nguyên prompt từ supabase/functions/analyze-face/index.ts.
            Khoảng 250 dòng định nghĩa PSL tiers, categories, output schema.
            """;
}
