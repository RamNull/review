package com.copilot.review.businesslogic;


import org.springframework.stereotype.Service;

import com.copilot.review.models.Product;

import reactor.core.publisher.ParallelFlux;


@Service
public class HandleProducts {

    // Currency conversion rate from USD to INR (example)
    private static final float CURRENCY_CONVERSION_RATE = 16.2f;

    public ParallelFlux<Product> handle(ParallelFlux<Product> products)
    {
       return products.map(x->{
            if(x.getId()%2==0) {
                x.setPrice((float)(x.getPrice() * CURRENCY_CONVERSION_RATE));
                try {
					Thread.sleep(1000);
                    System.out.println("thread Slept for 1 sec" + Thread.currentThread().getName());
				} catch (InterruptedException e) {
                    // Restore interrupted status
                    Thread.currentThread().interrupt();

				}
        }
        return x;
       });
    }

    
}
