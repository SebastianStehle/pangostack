import Chargebee from 'chargebee';

export async function findCustomer(chargebee: Chargebee, id: string) {
  try {
    const { customer } = await chargebee.customer.retrieve(id);
    return customer;
  } catch (ex: any) {
    if (ex.http_status_code === 404) {
      return null;
    } else {
      throw ex;
    }
  }
}

export async function findSubscription(chargebee: Chargebee, id: string) {
  try {
    const { subscription } = await chargebee.subscription.retrieve(id);
    return subscription;
  } catch (ex: any) {
    if (ex.http_status_code === 404) {
      return null;
    } else {
      throw ex;
    }
  }
}
