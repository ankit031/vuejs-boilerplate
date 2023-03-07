import ElementsService from './elementsService';
import CustomerService from './customerService';

const services = {
  elements: ElementsService,
  customer: CustomerService,
};

const ServiceFactory = {
  get: (name) => services[name],
};

export default ServiceFactory;
