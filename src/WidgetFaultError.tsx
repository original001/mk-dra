import type { AllFaults } from "./npm-loader";


export class WidgetFaultError extends Error {
  public fault: AllFaults;
  public type: AllFaults["type"];

  constructor(fault: AllFaults) {
    super(fault.message);
    this.fault = fault;
    this.type = fault.type;
  }
}
