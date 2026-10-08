package com.pedro.lab_control.security;

import java.security.Principal;

public record UsuarioAutenticado(String uid, String email) implements Principal {

    @Override
    public String getName() {
        return uid;
    }
}
