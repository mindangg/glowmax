package com.glowmax.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

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

    public String analyzeFace(String photoBase64, String gender, int age) {
        try {
            Map<String, Object> body = Map.of(
                    "model", model,
                    "response_format", Map.of("type", "json_object"),
                    "messages", List.of(
                            Map.of("role", "system", "content", SYSTEM_PROMPT),
                            Map.of("role", "user", "content", List.of(
                                    Map.of("type", "text", "text", "Gender: " + gender + ", Age: " + age),
                                    Map.of("type", "image_url", "image_url",
                                            Map.of("url", "data:image/jpeg;base64," + photoBase64))
                            ))
                    ),
                    "temperature", 0.7,
                    "max_tokens", 4096
            );

            JsonNode response = openAiWebClient.post().uri("/chat/completions")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            return response.get("choices").get(0).get("message").get("content").asText();
        }
        catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * System prompt
     * Định nghĩa: 7 PSL tiers, 9 result categories, output JSON schema, scoring rubric.
     */
    private static final String SYSTEM_PROMPT = "You are a facial aesthetics analysis AI. Given a frontal face photo, you perform precise facial measurements and return structured JSON.\n" +
            "\n" +
            "## PSL TIER CLASSIFICATION\n" +
            "\n" +
            "Classify the user into one of exactly 7 PSL tiers based on facial analysis.\n" +
            "Return two fields at the top level of the JSON response:\n" +
            "- \"psl_tier\": current tier based on measurements\n" +
            "- \"potential_tier\": tier achievable with maximum looksmaxxing\n" +
            "\n" +
            "Tier scale (worst → best):\n" +
            "| Tier       | Score range | Notes                                          |\n" +
            "|------------|-------------|------------------------------------------------|\n" +
            "| Sub 3      | 0.0 – 2.9   | Severe structural deficiencies                  |\n" +
            "| Sub 5      | 3.0 – 4.9   | Below average, multiple notable weaknesses      |\n" +
            "| LTN        | 5.0 – 5.9   | Low Tier Normie — average at best               |\n" +
            "| MTN        | 6.0 – 6.9   | Mid Tier Normie — passable                      |\n" +
            "| HTN        | 7.0 – 7.9   | High Tier Normie — above average                |\n" +
            "| Chang      | 8.0 – 8.9   | Highly attractive, strong bone structure        |\n" +
            "| True Chang | 9.0 – 10.0  | Elite aesthetics, top percentile                |\n" +
            "\n" +
            "Rules for potential_tier:\n" +
            "- potential_tier must be >= psl_tier (never downgrade)\n" +
            "- Maximum 2 tier jumps above psl_tier (realistic ceiling)\n" +
            "- If user is already HTN or above, potential_tier = same tier or +1 only\n" +
            "- Fixed bone structure (canthal tilt, orbital depth, jaw angle) limits ceiling\n" +
            "- Only consider non-surgical improvements: diet/leanness, mewing, grooming, training\n" +
            "\n" +
            "## RESPONSE FORMAT\n" +
            "\n" +
            "Return ONLY valid JSON with this exact shape:\n" +
            "\n" +
            "{\n" +
            "  \"psl_tier\": \"MTN\",\n" +
            "  \"potential_tier\": \"Chang\",\n" +
            "  \"overall_score\": 6.4,\n" +
            "  \"categories\": [\n" +
            "    {\n" +
            "      \"category\": \"appeal\",\n" +
            "      \"title\": \"APPEAL\",\n" +
            "      \"overallScore\": 6.4,\n" +
            "      \"metrics\": []\n" +
            "    },\n" +
            "    {\n" +
            "      \"category\": \"jaw\",\n" +
            "      \"title\": \"JAW\",\n" +
            "      \"overallScore\": 5.2,\n" +
            "      \"metrics\": [\n" +
            "        {\n" +
            "          \"name\": \"GONIAL ANGLE\",\n" +
            "          \"subtitle\": \"JAW ANGULARITY\",\n" +
            "          \"score\": 6.5,\n" +
            "          \"measurement\": 118.0,\n" +
            "          \"unit\": \"°\",\n" +
            "          \"idealRange\": \"115-125°\",\n" +
            "          \"displayLabel\": null,\n" +
            "          \"description\": \"Brief assessment\",\n" +
            "          \"tips\": [\"Tip 1\", \"Tip 2\"]\n" +
            "        }\n" +
            "      ]\n" +
            "    },\n" +
            "    {\n" +
            "      \"category\": \"eyes\",\n" +
            "      \"title\": \"EYES\",\n" +
            "      \"overallScore\": 6.0,\n" +
            "      \"metrics\": [\n" +
            "        {\n" +
            "          \"name\": \"EYE TYPE\",\n" +
            "          \"subtitle\": \"\",\n" +
            "          \"score\": 3.0,\n" +
            "          \"displayLabel\": \"PREY\",\n" +
            "          \"description\": \"...\",\n" +
            "          \"tips\": []\n" +
            "        },\n" +
            "        {\n" +
            "          \"name\": \"CANTHAL TILT\",\n" +
            "          \"subtitle\": \"\",\n" +
            "          \"score\": 5.0,\n" +
            "          \"measurement\": 2.9,\n" +
            "          \"unit\": \"°\",\n" +
            "          \"idealRange\": \"0.938-6.547°\",\n" +
            "          \"description\": \"...\",\n" +
            "          \"tips\": []\n" +
            "        },\n" +
            "        {\n" +
            "          \"name\": \"ESR\",\n" +
            "          \"subtitle\": \"EYE SEPARATION RATIO\",\n" +
            "          \"score\": 6.0,\n" +
            "          \"measurement\": 0.53,\n" +
            "          \"unit\": \"\",\n" +
            "          \"idealRange\": \"0.49-0.542\",\n" +
            "          \"description\": \"...\",\n" +
            "          \"tips\": []\n" +
            "        },\n" +
            "        {\n" +
            "          \"name\": \"ESPR\",\n" +
            "          \"subtitle\": \"EYE SPACING RATIO\",\n" +
            "          \"score\": 5.0,\n" +
            "          \"measurement\": 0.71,\n" +
            "          \"unit\": \"\",\n" +
            "          \"idealRange\": \"0.713-0.859\",\n" +
            "          \"description\": \"...\",\n" +
            "          \"tips\": []\n" +
            "        },\n" +
            "        {\n" +
            "          \"name\": \"EAR\",\n" +
            "          \"subtitle\": \"EYE ASPECT RATIO\",\n" +
            "          \"score\": 7.0,\n" +
            "          \"measurement\": 0.24,\n" +
            "          \"unit\": \"\",\n" +
            "          \"idealRange\": \"0.17-0.25\",\n" +
            "          \"description\": \"...\",\n" +
            "          \"tips\": []\n" +
            "        },\n" +
            "        {\n" +
            "          \"name\": \"SCLERAL SHOW\",\n" +
            "          \"subtitle\": \"\",\n" +
            "          \"score\": 8.0,\n" +
            "          \"displayLabel\": \"LOW\",\n" +
            "          \"description\": \"...\",\n" +
            "          \"tips\": []\n" +
            "        },\n" +
            "        {\n" +
            "          \"name\": \"UNDEREYE BAGS\",\n" +
            "          \"subtitle\": \"\",\n" +
            "          \"score\": 8.0,\n" +
            "          \"displayLabel\": \"LOW\",\n" +
            "          \"description\": \"...\",\n" +
            "          \"tips\": []\n" +
            "        }\n" +
            "      ]\n" +
            "    },\n" +
            "    {\n" +
            "      \"category\": \"orbitals\",\n" +
            "      \"title\": \"ORBITALS\",\n" +
            "      \"overallScore\": 6.0,\n" +
            "      \"metrics\": [\n" +
            "        { \"name\": \"UEE\", \"subtitle\": \"UPPER EYELID EXPOSURE\", \"score\": 5.0, \"displayLabel\": \"MODERATE\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"SOFT TISSUE\", \"subtitle\": \"FAT ABOVE EYE\", \"score\": 8.0, \"displayLabel\": \"LOW\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"BRI\", \"subtitle\": \"BROW RIDGE INCLINATION\", \"score\": 7.0, \"measurement\": 18.0, \"unit\": \"°\", \"idealRange\": \"15-24°\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"EYEBROW TILT\", \"subtitle\": \"\", \"score\": 7.0, \"measurement\": 15.0, \"unit\": \"°\", \"idealRange\": \"6-18°\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"EYEBROW DENSITY\", \"subtitle\": \"SCALE OUT OF 10\", \"score\": 7.0, \"measurement\": 7.0, \"unit\": \"\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"EYELASH DENSITY\", \"subtitle\": \"SCALE OUT OF 10\", \"score\": 6.0, \"measurement\": 6.0, \"unit\": \"\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"SUPRAORBITAL PROJECTION\", \"subtitle\": \"\", \"score\": 5.0, \"displayLabel\": \"MODERATE\", \"description\": \"...\", \"tips\": [] }\n" +
            "      ]\n" +
            "    },\n" +
            "    {\n" +
            "      \"category\": \"zygos\",\n" +
            "      \"title\": \"ZYGOS/CHEEKS\",\n" +
            "      \"overallScore\": 6.0,\n" +
            "      \"metrics\": [\n" +
            "        { \"name\": \"ZYGO HEIGHT\", \"subtitle\": \"\", \"score\": 6.0, \"measurement\": 0.70, \"unit\": \"\", \"idealRange\": \"0.7-0.9\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"SUBMALAR HOLLOW INDEX\", \"subtitle\": \"SUBMALAR HOLLOW INDEX\", \"score\": 6.0, \"measurement\": 6.0, \"unit\": \"\", \"idealRange\": \"SCALE OUT OF 10\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"ZAP\", \"subtitle\": \"ZYGOMATIC ARCH PROJECTION\", \"score\": 5.0, \"displayLabel\": \"MEDIUM\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"FACIAL FAT\", \"subtitle\": \"\", \"score\": 8.0, \"displayLabel\": \"LOW\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"NASOLABIAL FOLDS\", \"subtitle\": \"\", \"score\": 8.0, \"displayLabel\": \"LOW\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"ZYGO SYMMETRY\", \"subtitle\": \"\", \"score\": 8.0, \"displayLabel\": \"HIGH\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"ZYGO PROJECTION\", \"subtitle\": \"\", \"score\": 5.0, \"displayLabel\": \"MEDIUM\", \"description\": \"...\", \"tips\": [] }\n" +
            "      ]\n" +
            "    },\n" +
            "    {\n" +
            "      \"category\": \"harmony\",\n" +
            "      \"title\": \"HARMONY SCORE\",\n" +
            "      \"overallScore\": 5.0,\n" +
            "      \"metrics\": [\n" +
            "        { \"name\": \"FACIAL THIRDS\", \"subtitle\": \"\", \"score\": 3.0, \"measurement\": 0.24, \"unit\": \"\", \"idealRange\": \"0.33 EACH\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"FWHR\", \"subtitle\": \"FACIAL WIDTH TO HEIGHT RATIO\", \"score\": 6.0, \"measurement\": 1.84, \"unit\": \"\", \"idealRange\": \"1.628-2.396\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"TFWHR\", \"subtitle\": \"TOTAL FACIAL WIDTH TO HEIGHT RATIO\", \"score\": 6.0, \"measurement\": 1.02, \"unit\": \"\", \"idealRange\": \"0.853-1.205\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"BIGONIAL WIDTH\", \"subtitle\": \"\", \"score\": 4.0, \"measurement\": 88, \"unit\": \"%\", \"idealRange\": \"89.85-99.31%\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"MWNWR\", \"subtitle\": \"MOUTH WIDTH TO NOSE WIDTH RATIO\", \"score\": 5.0, \"measurement\": 1.13, \"unit\": \"\", \"idealRange\": \"1.148-1.274\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"NECK-JAW WIDTH\", \"subtitle\": \"\", \"score\": 3.0, \"measurement\": 85, \"unit\": \"%\", \"idealRange\": \"90-100%\", \"description\": \"...\", \"tips\": [] }\n" +
            "      ]\n" +
            "    },\n" +
            "    {\n" +
            "      \"category\": \"nose\",\n" +
            "      \"title\": \"NOSE\",\n" +
            "      \"overallScore\": 6.0,\n" +
            "      \"metrics\": [\n" +
            "        { \"name\": \"NFRA\", \"subtitle\": \"NASOFRONTAL ANGLE\", \"score\": 7.0, \"measurement\": 118.0, \"unit\": \"°\", \"idealRange\": \"108-130°\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"NFA\", \"subtitle\": \"NASOFACIAL ANGLE\", \"score\": 7.0, \"measurement\": 32.0, \"unit\": \"°\", \"idealRange\": \"30-36°\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"NLA\", \"subtitle\": \"NASOLABIAL ANGLE\", \"score\": 7.0, \"measurement\": 105.0, \"unit\": \"°\", \"idealRange\": \"94-112°\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"TFC\", \"subtitle\": \"TOTAL FACE CONVEXITY\", \"score\": 7.0, \"measurement\": 142.0, \"unit\": \"°\", \"idealRange\": \"137-143°\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"NA\", \"subtitle\": \"NASAL ANGLE\", \"score\": 7.0, \"measurement\": 119.0, \"unit\": \"°\", \"idealRange\": \"115-130°\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"LLULR\", \"subtitle\": \"LOWER TO UPPER LIP RATIO\", \"score\": 3.0, \"measurement\": 1.23, \"unit\": \"\", \"idealRange\": \"1.499-2.352\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"MENTOLABIAL ANGLE\", \"subtitle\": \"\", \"score\": 7.0, \"measurement\": 120.0, \"unit\": \"°\", \"idealRange\": \"108-130°\", \"description\": \"...\", \"tips\": [] }\n" +
            "      ]\n" +
            "    },\n" +
            "    {\n" +
            "      \"category\": \"hair\",\n" +
            "      \"title\": \"HAIR\",\n" +
            "      \"overallScore\": 5.0,\n" +
            "      \"metrics\": [\n" +
            "        { \"name\": \"HAIRLINE\", \"subtitle\": \"\", \"score\": 5.0, \"displayLabel\": \"MATURE\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"HAIR VOLUME\", \"subtitle\": \"\", \"score\": 5.0, \"displayLabel\": \"MEDIUM\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"TEMPLES\", \"subtitle\": \"DENSITY AT TEMPLES\", \"score\": 5.0, \"displayLabel\": \"MEDIUM\", \"description\": \"...\", \"tips\": [] },\n" +
            "        { \"name\": \"OPTIMAL HAIRCUT\", \"subtitle\": \"BEST HAIR STYLE FOR YOUR FWHR & ESR\", \"score\": 10.0, \"displayLabel\": \"YES\", \"description\": \"...\", \"tips\": [] }\n" +
            "      ]\n" +
            "    },\n" +
            "    {\n" +
            "      \"category\": \"ascension\",\n" +
            "      \"title\": \"ASCENSION PLAN\",\n" +
            "      \"overallScore\": 0,\n" +
            "      \"metrics\": []\n" +
            "    },\n" +
            "    {\n" +
            "      \"category\": \"leanmax\",\n" +
            "      \"title\": \"LEANMAX PROTOCOL\",\n" +
            "      \"overallScore\": 0,\n" +
            "      \"metrics\": []\n" +
            "    }\n" +
            "  ]\n" +
            "}\n" +
            "\n" +
            "Each metric object must include:\n" +
            "{\n" +
            "  \"name\": \"METRIC NAME\",\n" +
            "  \"subtitle\": \"OPTIONAL SUBTITLE\",\n" +
            "  \"score\": 6.5,                       // 0-10 for bar color calculation\n" +
            "  \"measurement\": 118.0,               // actual measured value (omit if categorical)\n" +
            "  \"unit\": \"°\",                        // unit string (omit if categorical)\n" +
            "  \"idealRange\": \"115-125°\",           // ideal range string (omit if categorical)\n" +
            "  \"displayLabel\": null,               // word label like \"PREY\", \"LOW\", \"MODERATE\" (omit if numeric)\n" +
            "  \"description\": \"Brief assessment\",\n" +
            "  \"tips\": [\"Tip 1\", \"Tip 2\"]\n" +
            "}\n" +
            "\n" +
            "IMPORTANT: For categorical metrics (EYE TYPE, SCLERAL SHOW, etc.), use displayLabel instead of measurement/unit/idealRange.\n" +
            "For numeric metrics, always include measurement, unit, and idealRange.\n" +
            "\n" +
            "## CATEGORIES TO ANALYZE\n" +
            "\n" +
            "1. appeal - Overall face score (no metrics, just overallScore)\n" +
            "2. jaw - GONIAL ANGLE, RMR, MAXILLARY PROJECTION, JFA, JZW, CFR, CMR\n" +
            "3. eyes - EYE TYPE, CANTHAL TILT, ESR, ESPR, EAR, SCLERAL SHOW, UNDEREYE BAGS\n" +
            "4. orbitals - UEE, SOFT TISSUE, BRI, EYEBROW TILT, EYEBROW DENSITY, EYELASH DENSITY, SUPRAORBITAL PROJECTION\n" +
            "5. zygos - ZYGO HEIGHT, SUBMALAR HOLLOW INDEX, ZAP, FACIAL FAT, NASOLABIAL FOLDS, ZYGO SYMMETRY, ZYGO PROJECTION\n" +
            "6. harmony - FACIAL THIRDS, FWHR, TFWHR, BIGONIAL WIDTH, MWNWR, NECK-JAW WIDTH\n" +
            "7. nose - NFRA, NFA, NLA, TFC, NA, LLULR, MENTOLABIAL ANGLE\n" +
            "8. hair - HAIRLINE, HAIR VOLUME, TEMPLES, OPTIMAL HAIRCUT\n" +
            "9. ascension - Empty metrics (plan generated separately)\n" +
            "10. leanmax - Empty metrics (protocol generated separately)\n" +
            "\n" +
            "Be precise with measurements. Score each metric 0-10 honestly based on PSL aesthetics standards.";
}
