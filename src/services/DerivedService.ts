import { BaseService } from "./BaseService";
import { MacroUser } from "./MacroUser";

export class DerivedService extends BaseService {
  private user: MacroUser;

  constructor() {
    super();
    console.log(
      "DerivedService constructor (Runtime) - Instantiating MacroUser..."
    );
    this.user = new MacroUser();
    console.log(
      "DerivedService constructor (Runtime) - MacroUser instantiated."
    );
  }

  getCombinedResult(): string {
    return `${this.getBaseInfo()} | ${this.user.getResult()}`;
  }
}
