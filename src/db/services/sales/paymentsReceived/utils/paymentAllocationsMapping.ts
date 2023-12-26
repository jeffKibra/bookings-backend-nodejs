import {
  IPaymentAllocation,
  IPaymentAllocationMapping,
  IPaymentAllocationMappingResult,
} from '../../../../../types';

export default class PaymentAllocationsMapping {
  allocationsToDelete: IPaymentAllocationMapping[];
  allocationsToUpdate: IPaymentAllocationMapping[];
  allocationsToCreate: IPaymentAllocationMapping[];
  similarAllocations: IPaymentAllocationMapping[];
  //
  currentAllocationsObject: Record<string, IPaymentAllocation>;

  constructor(currentPaymentAllocations?: IPaymentAllocation[]) {
    this.allocationsToCreate = [];
    this.allocationsToUpdate = [];
    this.allocationsToDelete = [];
    this.similarAllocations = [];
    //

    const currentAllocationsObject =
      PaymentAllocationsMapping.convertAllocationsArrayToObject(
        currentPaymentAllocations
      );

    this.currentAllocationsObject = currentAllocationsObject;
  }

  private appendCurrentAllocation(allocation: IPaymentAllocation) {
    const { ref, amount } = allocation;

    if (amount < 0) {
      //cant have negative values
      PaymentAllocationsMapping.throwPositiveNumberError(ref);
    }

    this.currentAllocationsObject[ref] = allocation;
  }

  appendIncomingAllocation(allocation: IPaymentAllocation) {
    const { ref, amount: incoming, transactionType } = allocation;

    const { currentAllocationsObject } = this;

    const current = currentAllocationsObject[ref]?.amount || 0;

    if (incoming < 0 || current < 0) {
      //cant have negative values
      PaymentAllocationsMapping.throwPositiveNumberError(ref);
    }

    const dataMapping: IPaymentAllocationMapping = {
      incoming,
      current,
      ref,
      transactionType,
    };

    if (incoming > 0 && current === 0) {
      /**
       * booking not in current payments
       * add it to allocationsToCreate
       */
      this.allocationsToCreate.push(dataMapping);
    } else {
      /**
       * similar booking has been found-check if the amounts are equal
       * if equal, add to similars array-else add to allocationsToUpdate array
       */
      if (incoming === current) {
        this.similarAllocations.push(dataMapping);
      } else {
        this.allocationsToUpdate.push(dataMapping);
      }
      /**
       * current invoice payment has been processed.
       * delete from list to avoid duplicates
       */

      this.deleteCurrentAllocation(ref);
    }

    return dataMapping;
  }

  private deleteCurrentAllocation(ref: string) {
    try {
      delete this.currentAllocationsObject[ref];
    } catch (error) {
      console.warn(`Error deleting current allocation. ref: ${ref}`);
      console.error(error);
    }
  }

  generateMapping(): IPaymentAllocationMappingResult {
    const { currentAllocationsObject } = this;

    //
    if (!currentAllocationsObject) {
      throw new Error('Invalid incoming payment allocations!');
    }

    /**
     * mark any remaining current allocations for deletion
     */
    Object.keys(currentAllocationsObject).forEach(ref => {
      const allocation = currentAllocationsObject[ref];
      const { transactionType, amount } = allocation;

      const dataMapping: IPaymentAllocationMapping = {
        current: 0,
        incoming: amount,
        ref,
        transactionType,
      };

      this.allocationsToDelete.push(dataMapping);

      /**
       * incoming invoice payment has been processed.
       * delete from list to avoid duplicates
       */
      this.deleteCurrentAllocation(ref);
    });

    const {
      allocationsToCreate,
      allocationsToUpdate,
      allocationsToDelete,
      similarAllocations,
    } = this;

    console.log('allocations to create', allocationsToCreate);
    console.log('allocations to update', allocationsToUpdate);
    console.log('allocations to delete', allocationsToDelete);
    console.log('similar allocations', similarAllocations);

    const uniqueAllocations = [
      ...allocationsToCreate,
      ...allocationsToUpdate,
      ...allocationsToDelete,
      ...similarAllocations,
    ];

    return {
      uniqueAllocations,
      similarAllocations,
      allocationsToCreate,
      allocationsToUpdate,
      allocationsToDelete,
    };
  }

  //--------------------------------------------------------------------
  //STATIC METHODS
  //--------------------------------------------------------------------

  static throwPositiveNumberError(allocationRef: string) {
    throw new Error(
      `Only positive numbers for invoice payments allowed! ref: ${allocationRef}`
    );
  }

  //-------------------------------------------------------------------
  static convertAllocationsArrayToObject(allocations?: IPaymentAllocation[]) {
    const allocationsObject: Record<string, IPaymentAllocation> = {};

    if (Array.isArray(allocations)) {
      allocations.forEach(allocation => {
        const { ref, amount } = allocation;

        if (amount < 0) {
          //cant have negative values
          PaymentAllocationsMapping.throwPositiveNumberError(ref);
        }

        allocationsObject[ref] = allocation;
      });
    }

    return allocationsObject;
  }
}
