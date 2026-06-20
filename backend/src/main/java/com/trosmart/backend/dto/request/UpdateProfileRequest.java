package com.trosmart.backend.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(max = 255, message = "Họ tên tối đa 255 ký tự")
    private String fullName;

    @Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @Size(max = 13, message = "Số CCCD tối đa 13 ký tự")
    @Pattern(regexp = "^[0-9]{12,13}$", message = "Số CCCD không hợp lệ")
    private String cccdNumber;
}
