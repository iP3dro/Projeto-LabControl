package com.pedro.lab_control.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Aplica a regra para todas as URLs API
                .allowedOrigins("*") // Permite acesso de qualquer lugar
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Permite esses verbos HTTP
                .allowedHeaders("*");
    }
}
