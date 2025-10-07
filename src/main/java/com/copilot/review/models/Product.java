package com.copilot.review.models;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class Product {
    private int productId;
    private String productName;
    private String productDescription;
    private int price;
    private String dimension;
}
