package com.pedro.lab_control.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class FirebaseTokenFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Ignora requisições de CORS (OPTIONS)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            System.out.println("Filtro Firebase: Ignorando requisição OPTIONS.");
            filterChain.doFilter(request, response);
            return;
        }

        // Procura o token no cabeçalho Authorization
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7); // Remove a palavra "Bearer "

            try {
                System.out.println("Filtro Firebase: Validando token recebido do celular...");

                // Verificar se este token é válido
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);

                System.out.println("Filtro Firebase: Sucesso! Usuário autenticado com UID: " + decodedToken.getUid());

                // Se for válido mostra quem é o usuário logado
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        decodedToken.getUid(), null, new ArrayList<>());

                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (Exception e) {
                System.err.println("Filtro Firebase: ERRO AO VALIDAR O TOKEN!");
                System.err.println("Motivo do erro: " + e.getMessage());

                SecurityContextHolder.clearContext();
            }
        } else {
            System.out.println("Filtro Firebase: Nenhum token encontrado na requisição para a rota: " + request.getRequestURI());
        }

        filterChain.doFilter(request, response);
    }
}