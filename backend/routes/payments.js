
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { paymentDb } = require('../database');
const MERCADO_PAGO_TOKEN = 'APP_USR-957794627794363-082308-6665c8bdcf1ceeeb07e1c6a3430fb855-198355928';

// Create PIX payment
router.post('/pix', async (req, res) => {
  try {
    const paymentData = req.body;

    // Call Mercado Pago API to create PIX payment
    const response = await axios.post(
      'https://api.mercadopago.com/v1/payments',
      {
        ...paymentData,
        payment_method_id: paymentData.paymentMethodId
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MERCADO_PAGO_TOKEN}`
        }
      }
    );

    // Record payment in database
    if (response.data && response.data.id) {
      await paymentDb.recordPayment({
        paymentId: response.data.id,
        userId: req.body.userId || 'anonymous',
        amount: paymentData.transaction_amount,
        description: paymentData.description,
        status: response.data.status
      });
    }

    res.json({
      success: true,
      result: response.data,
      point_of_interaction: response.data.point_of_interaction
    });
  } catch (error) {
    console.error('Error creating PIX payment:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message
    });
  }
});

// Verify payment status
router.get('/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        Authorization: `Bearer ${MERCADO_PAGO_TOKEN}`
      }
    });

    // Update payment status in our database
    await paymentDb.updatePaymentStatus(id, response.data.status);

    res.json({
      success: true,
      status: response.data.status,
      approved: response.data.status === 'approved',
      data: response.data
    });
  } catch (error) {
    console.error('Error verifying payment:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message
    });
  }
});

module.exports = router;
