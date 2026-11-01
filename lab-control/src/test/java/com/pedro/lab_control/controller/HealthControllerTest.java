package com.pedro.lab_control.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class HealthControllerTest {

    @Test
    void healthRetornaStatusOk() {
        HealthController controller = new HealthController();

        ResponseEntity<Map<String, String>> response = controller.health();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("ok", response.getBody().get("status"));
    }
}
