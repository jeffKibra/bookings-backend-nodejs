//returns js equivalent of Object.values(Obj) for types- indexed access types
type ValueOf<Obj> = Obj[keyof Obj];
//keyof Obj=js equivalent of Object.keys(Obj) for types- returns keys of type
/**
 * return as union type e.g "age"|"name"|"email"
 * key extends keyof Obj- ensures the 2nd parameter(key) is available in the Obj
 */
type OneOnly<Obj, Key extends keyof Obj> = {
  /**
   * loop over all the keys of the object type except the
   *  one we passed as the 2nd
   * argument of the generic.
   * For all those keys, we say that the only value they can accept is null
   */
  [key in Exclude<keyof Obj, Key>]: null;
  /**
   * finally, extract the key from the object type
   */
} & Pick<Obj, Key>;
/**
 * loop over the keys of the object type to generate all the
 * OneOnly types for every key
 */
type OneOfByKey<Obj> = { [key in keyof Obj]: OneOnly<Obj, key> };

export type OneOfType<Obj> = ValueOf<OneOfByKey<Obj>>;
