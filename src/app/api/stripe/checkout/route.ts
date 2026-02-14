import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    const stripe = getStripe();
    if (!stripe || !process.env.STRIPE_PRO_PRICE_ID) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://chud2chad.vercel.app'}/?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://chud2chad.vercel.app'}/?canceled=true`,
      metadata: {
        userId: userId || 'anonymous',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
