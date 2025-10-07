package com.copilot.review.models;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class Product {
    private Long productId;
    private String productName;
    private String productDescription;
    private BigDecimal price;
    private String dimension;
}
