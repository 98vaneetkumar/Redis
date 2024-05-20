const stripe = require('stripe')(process?.env?.STRIPE_SECRET_KEY);
stripePayment = {
    createStripeCustemer: async (custemeData) => {
        try {
            const error = { message: "", statusCode: 501 };
            if (!custemeData?.name) {
                error.message = "name is required for create stripe custemer";
            }
            if (!custemeData?.email) {
                error.message = "email is required for create stripe custemer";
            }
            if (!custemeData?.phone) {
                error.message = "phone is required for create stripe custemer";
            }
            if (!custemeData?.description) {
                error.message = "name is required for create stripe custemer";
            }
            if (!custemeData?.balance) custemeData.balance = 0;
            const customer = await stripe.customers.create(custemeData);
            return customer?.id;
        } catch (err) {
            throw err;
        }
    },
    getCustemerDetails: async (custemerId) => {
        try {
            const customer = await stripe.customers.retrieve(custemerId);
            return customer;
        } catch (err) {
            throw err;
        }
    },
    /**
     * @param {Object}
     */
    card: {
        createCard: async (custemerId, cardToken, isFirstCard) => {
            try {
                let isDefault = false;
                if (isFirstCard) isDefault = true;
                const card = await stripe.customers.createSource(custemerId, {
                    source: cardToken,
                    metadata: { cardToken, isDefault, paymentId: null },
                });
                return card;
            } catch (err) {
                throw err;
            }
        },
        getCard: async (custemerId, cardId) => {
            try {
                const card = await stripe.customers.retrieveSource(
                    custemerId,
                    cardId
                );
                return card;
            } catch (err) {
                throw err;
            }
        },
        getAllCard: async (custemerId, limit) => {
            try {
                const option = { object: "card" };
                if (limit) option.limit = parseInt(limit);
                const cards = await stripe.customers.listSources(custemerId, option);
                return cards;
            } catch (err) {
                throw err;
            }
        },
        updateCard: async (custemerId, cardId, data) => {
            try {
                const card = await stripe.customers.updateSource(
                    custemerId,
                    cardId,
                    data ? (typeof data === "object" ? data : {}) : {}
                );
                return card;
            } catch (err) {
                throw err;
            }
        },
        deleteCard: async (custemerId, cardId) => {
            try {
                const deleted = await stripe.customers.deleteSource(
                    custemerId,
                    cardId
                );
                return deleted;
            } catch (err) {
                throw err;
            }
        },
        ByCardIdPayment:async(amount,cardId="card_1PFwVlF4kqAO08XQxqqrWAhh",customerId ='cus_Q529Bywshd0e2k')=>{
            const charge = await stripe.charges.create({
            amount: amount,
            currency: 'usd',
            description: 'Example charge',
            source: cardId,
            customer:customerId,
            // metadata: {order_id: '6735'},
          });
            
          console.log(charge,"DDDD");
          return charge;
        }
    },
    payment: {
        createPaymentMethodForCard: async (cardToken) => {
            try {
                const paymentMethod = await stripe.paymentMethods.create({
                    type: "card",
                    card: { token: cardToken },
                });
                return paymentMethod;
            } catch (err) {
                throw err;
            }
        },
        atachPaymentMethodToCustemer: async (customerId, paymentMethodId) => {
            try {
                const paymentMethod = await stripe.paymentMethods.attach(
                    paymentMethodId,
                    { customer: customerId }
                );
                return paymentMethod;
            } catch (err) {
                throw err;
            }
        },
        detachPaymentMethodToCustemer: async (paymentMethidId) => {
            try {
                const paymentMethod = await stripe.paymentMethods.detach(
                    paymentMethidId
                );
                return paymentMethod;
            } catch (err) {
                throw err;
            }
        },
        getAllPaymentMethod: async (customerId) => {
            try {
                const paymentMethods = await stripe.paymentMethods.list({
                    customer: customerId,
                    type: "card",
                });
                return paymentMethods;
            } catch (err) {
                throw err;
            }
        },
        verifyPaymenyIntent: async (paymentid, payment_method) => {
            try {
                const paymentIntent = await stripe.paymentIntents.confirm(paymentid, {
                    payment_method,
                    return_url: "https://www.example.com",
                });
            } catch (err) {
                throw err;
            }
        },
        createPaymentIntent: async (amount, cardId, customerId, orderId) => {
            try {
                const paymentIntent = await stripe.paymentIntents.create({
                    payment_method_types: ["card"],
                    amount: Math.round(amount * 100),
                    payment_method: cardId,
                    currency: "INR",
                    customer: customerId,
                    confirm: true,
                    description: "My order payment",
                    metadata: {
                        orderId,
                    },
                });
                paymentIntent.url = "";
                if (paymentIntent.next_action) {
                    paymentIntent.url =
                        paymentIntent.next_action.use_stripe_sdk.stripe_js;
                    //Verify payment intent
                    await this.stripePayment.payment.verifyPaymenyIntent;
                }
                return paymentIntent;
            } catch (err) {
                throw err;
            }
        },
        confirmPaymentIntent: async (paymentIntent) => {
            try {
                const intent = await stripe.paymentIntents.confirm(paymentIntent, {
                    payment_method: ["card"],
                });
                return intent;
            } catch (err) {
                throw err;
            }
        },
    },
    bank: {
        addBankAccound: async (stripeCustemerId, bankDetails, isDefault) => {
            try {
                if (!isDefault) isDefault = false;
                const validationSchemaStripeCumtemerId = Joi.string().required();
                const validationSchameBankDetails = Joi.object()
                    .required()
                    .keys({
                        object: Joi.string().valid("bank_account"),
                        account_holder_name: Joi.string().required(),
                        account_holder_type: Joi.string().required(),
                        account_number: Joi.string().required(),
                        routing_number: Joi.string().required(),
                        country: Joi.string().required(),
                        currency: Joi.string().required(),
                    });
                this.dataValidator(
                    validationSchemaStripeCumtemerId,
                    stripeCustemerId
                );
                bankDetails.object = "bank_account";
                this.dataValidator(validationSchameBankDetails, bankDetails);
                let maskAccountNumber = bankDetails?.account_number;
                maskAccountNumber = maskAccountNumber.slice(
                    maskAccountNumber.length - 4
                );
                maskAccountNumber = `XXXXXXXX${maskAccountNumber}`;
                const status = await this.stripe.customers.createSource(
                    stripeCustemerId,
                    {
                        bank_account: bankDetails,
                        metadata: { isDefault, maskAccountNumber },
                    }
                );
                return status;
            } catch (err) {
                throw err;
            }
        },
        getAllBankList: async (custemertId) => {
            try {
                const response = await axios.get(
                    `https://api.stripe.com/v1/customers/${custemertId}/bank_accounts`,
                    {
                        params: {
                            limit: "4",
                        },
                        auth: {
                            username: this.STRIPE_SECRET_KEY,
                        },
                    }
                );
                return response?.data;
            } catch (err) {
                throw err;
            }
        },
        setDefaultBank: async (custemerId, bankId, isDefault) => {
            try {
                if (!custemerId) throw "custemerId required";
                if (!bankId) throw "bankId required";
                if (!isDefault) throw "isDefault required";
                if (typeof isDefault !== "boolean")
                    throw "isDefault should we boolien";
                const customerSource = await stripe.customers.updateSource(
                    custemerId,
                    bankId,
                    {
                        metadata: {
                            isDefault,
                        },
                    }
                );
                return customerSource;
            } catch (err) {
                throw err;
            }
        },
        deleteBank: async (custemerId, bankId) => {
            try {
                const customerSource = await this.stripe.customers.deleteSource(
                    custemerId,
                    bankId
                );
                return customerSource;
            } catch (err) {
                throw err;
            }
        },
        verifyBankAccount: async (custemerId, bankId) => {
            try {
                if (!custemerId) throw "custemerId required";
                if (!bankId) throw "bankId required";
                const bankAccount = await stripe.customers.verifySource(
                    custemerId,
                    bankId,
                    {
                        amounts: [32, 45],
                    }
                );
                return bankAccount;
            } catch (err) {
                throw err;
            }
        },
    },
    walet: {
        addamountToWalet: async (custemerId, amount) => {
            if (!custemerId) throw "addamountToWalet required";
            if (!amount) throw "amount is required";
            if (typeof amount !== "number") throw "amount should we number";
            const custemerDetails = await this.stripePayment.getCustemerDetails(
                custemerId
            );
            if (!custemerDetails) throw "Invalid custemerId not found";
            let currentAmount = custemerDetails?.balance;
            currentAmount = currentAmount + parseInt(amount);
            try {
                const customer = await stripe.customers.update(custemerId, {
                    balance: currentAmount,
                });
                return customer;
            } catch (err) {
                throw err;
            }
        },
        transferCustomerBalanceToBank: async (customerId, amount) => {
            try {
                const cutemereBalance = await this.stripePayment.getCustemerDetails(
                    customerId
                );
                if (cutemereBalance?.balance === 0) {
                    throw "You don't have sufficient fund for transfer";
                }
                if (cutemereBalance?.balance < parseInt(amount)) {
                    throw "You don't have sufficient fund for transfer";
                }
                const updatedAmount = cutemereBalance?.balance - amount;
                const updatedStatus = await stripe.customers.update(customerId, {
                    balance: updatedAmount,
                });
                return cutemereBalance;
            } catch (error) {
                console.error("Error transferring customer balance:", error);
                throw error;
            }
        },
    },
};

module.exports = stripePayment;