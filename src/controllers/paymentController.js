 import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { bookingId, userId, seats, totalPrice } = req.body;

    // Validate input
    if (!bookingId || !userId || !seats || !totalPrice) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Movie Ticket Booking",
              description: `Seats: ${seats.join(", ")}`,
            },
            unit_amount: Math.round(totalPrice * 100), // convert to paise
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
      metadata: {
        bookingId,
        userId,
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe Checkout Error:", error.message);
    res.status(500).json({ message: "Failed to create Stripe session" });
  }
};
