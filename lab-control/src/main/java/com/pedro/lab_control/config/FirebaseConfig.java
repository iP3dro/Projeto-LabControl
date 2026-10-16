package com.pedro.lab_control.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.credentials:}")
    private String credenciais;

    @PostConstruct
    public void inicializarFirebase() {
        if (!FirebaseApp.getApps().isEmpty()) {
            return;
        }

        try (InputStream serviceAccount = resolverCredenciais()) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();
            FirebaseApp.initializeApp(options);
            logger.info("Firebase inicializado com sucesso.");
        } catch (Exception e) {
            throw new IllegalStateException("Falha ao inicializar o Firebase: " + e.getMessage(), e);
        }
    }

    private InputStream resolverCredenciais() {
        if (credenciais != null && !credenciais.isBlank()) {
            return new ByteArrayInputStream(credenciais.getBytes(StandardCharsets.UTF_8));
        }

        InputStream recurso = getClass().getClassLoader().getResourceAsStream("firebase-key.json");
        if (recurso == null) {
            throw new IllegalStateException(
                    "Credenciais do Firebase ausentes. Defina a variável FIREBASE_CREDENTIALS ou inclua o arquivo firebase-key.json.");
        }
        return recurso;
    }
}
