package com.pedro.lab_control.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void inicializarFirebase() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {

                // Vai procurar o ficheiro dentro da pasta resources
                InputStream serviceAccount = getClass().getClassLoader().getResourceAsStream("firebase-key.json");

                if (serviceAccount == null) {
                    throw new RuntimeException("Ficheiro firebase-key.json não encontrado na pasta resources!");
                }

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                FirebaseApp.initializeApp(options);
                System.out.println("Firebase inicializado com sucesso!");
            }
        } catch (Exception e) {
            System.err.println("Erro ao inicializar o Firebase: " + e.getMessage());
            e.printStackTrace();
        }
    }
}