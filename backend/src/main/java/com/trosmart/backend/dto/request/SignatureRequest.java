package com.trosmart.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignatureRequest {
    private Long contractId;
    private String otpCode;
}