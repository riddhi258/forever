import orderModel from "../modals/orderModal.js";
import userModel from "../modals/userModel.js";
import Stripe from "stripe"

const currency = 'inr'
const deliveryCharge = 10

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
// placing an order using cod method
const placeOrder = async (req, res) => {
  try {
   
    const userId = req.user?._id || req.body.userId;
    const { items, Amount, address } = req.body;
    if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const orderData = {
        userId,
        items,
        Amount,
        address,
        status: 'Order placed',
        paymentMethod: 'cod',
        payment: false,
        date: new Date()
    };
    const order = new orderModel(orderData); 
    await order.save();

    await userModel.findByIdAndUpdate(userId, { cartData: {} });
    res.json({ success: true, message: "Order placed successfully" });
  } catch (error) {
       console.error( error);
       res.json({ success: false, message: "Internal server error" });
  }
}

// placing an order using stripe method
const placeOrderWithStripe = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { items, Amount, address, email } = req.body;
    const { origin } = req.headers;

    const currency = 'INR'; 
    const deliveryCharge = 10; 

    // Save order in DB
    const orderData = {
      userId,
      items,
      Amount,
      address,
      status: 'Order placed',
      paymentMethod: 'stripe',
      payment: false,
      date: new Date()
    };

    const order = new orderModel(orderData);
    await order.save();

    // Stripe line items
    const line_items = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100, // Stripe expects amount in smallest unit (cents)
      },
      quantity: item.quantity,
    }));

    // Add delivery charge as a separate line item
    line_items.push({
      price_data: {
        currency: currency,
        product_data: {
          name: 'Delivery Charges',
        },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${order._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${order._id}`,
      line_items,
      mode: 'payment',
      billing_address_collection: 'required', // ✅ REQUIRED FOR EXPORT TRANSACTIONS
      customer_email: email, // ✅ Helps Stripe track customer
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'IN'], // ✅ Adjust to your expected customers
      },
      customer_creation: 'always', // Optional but helpful
    });

    res.json({ success: true, session_url: session.url });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Internal server error" });
  }
};

const verifyStripe = async (req,res) =>{
  const {orderId,success,userId} = req.body
  try {
    if (success === 'true'){
      await orderModel.findByIdAndUpdate(orderId,{payment : true})
      await userModel.findByIdAndUpdate(userId,{cartData :{}})
      res.json({success:true})
    }else{
       await orderModel.findByIdAndDelete(orderId)
       res.json({success:false})
    }  
  } catch (error) {
      console.log(error)
      res.json({success:false,message:error.message})
  }
}


// All Orders data for admin panel
const allOrders = async (req, res) => {
  try {
  const orders = await orderModel.find({})
  res.json({success:true,orders})
  } catch (error) {
   console.log(error)
   res,json({success:false,message:error.message})
  }
}

// User Orders data for user panel
const userOrders = async (req, res) => {
  try {
     const userId = req.user?._id || req.body.userId;
     const orders = await orderModel.find({userId})
     res.json ({success:true, orders})
  } catch (error) {
     console.log(error);
     res.json({ success: false, message: "Internal server error" });
  }
}

// updating order status for  admin panel
const updateStatus = async (req, res) => {
  try {
    const{orderId,status} =req.body;
    await orderModel.findByIdAndUpdate(orderId,{status})
    res.json({success:true , message : 'status updated'})
  } catch (error) {
     console.log(error)
     res,json({success:false,message:error.message})
  }
}
export{placeOrder, placeOrderWithStripe, allOrders, userOrders,updateStatus,verifyStripe};