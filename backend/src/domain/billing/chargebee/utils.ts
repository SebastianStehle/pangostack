import Chargebee from 'chargebee';

export async function findCustomer(chargebee: Chargebee, id: string) {
  try {
    const { customer } = await chargebee.customer.retrieve(id);
    return customer;
  } catch (error: any) {
    if (error.http_status_code === 404) {
      return null;
    } else {
      throw error;
    }
  }
}

export async function findSubscription(chargebee: Chargebee, id: string) {
  try {
    const { subscription } = await chargebee.subscription.retrieve(id);
    return subscription;
  } catch (error: any) {
    if (error.http_status_code === 404) {
      return null;
    } else {
      throw error;
    }
  }
}
