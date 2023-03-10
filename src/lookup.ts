type Cat = {
  type: "cat";
  age: number;
  isDomestic: boolean;
  catProp: "meow";
};

type Dog = {
  type: "dog";
  age: number;
  isDomestic: boolean;
  dogProp: "bark";
};

type Unicorn = {
  type: "unicorn";
  age: number;
  isDomestic: boolean;
  unicornProp: "?" | "other";
};

type Animal = Cat | Dog | Unicorn;

const animals = [
  {
    type: "cat",
    age: 23,
    isDomestic: true,
    catProp: "meow",
  },
  {
    type: "dog",
    age: 33,
    isDomestic: true,
    dogProp: "bark",
  },
  {
    type: "unicorn",
    age: 13,
    isDomestic: false,
    unicornProp: "?",
  },
  {
    type: "unicorn",
    age: 13,
    isDomestic: false,
    unicornProp: "other",
  },
] as const satisfies readonly Animal[];

type LookUp<T, TRecord> = Extract<T, TRecord>;
type GetValueByKey<T, Key extends PropertyKey, TFilterByKey = FilterByKey<T, Key>> = TFilterByKey[keyof TFilterByKey];

// https://stackoverflow.com/questions/61685168/is-it-possible-to-get-the-keys-from-a-union-of-objects
type GetAllKeys<T> = T extends any ? keyof T : never;

// https://stackoverflow.com/questions/61410242/is-it-possible-to-exclude-an-empty-object-from-a-union
type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];
type ExcludeEmpty<T> = T extends AtLeastOne<T> ? T : never;

type FilterByKey<T, Key extends PropertyKey> = ExcludeEmpty<{
      [key in keyof T as key extends Key ? key : never]: T[key];
    }>

function filterByKeyValue<
  const Key extends GetAllKeys<TArr[number]>,
  const Value extends GetValueByKey<TArr[number], Key>,
  TArr extends readonly any[],
>(key: Key, value: Value, arr: TArr) {
  return arr.filter((obj): obj is LookUp<TArr[number], Record<Key, Value>> => obj[key] === value);
}

/*********************************************************************** */
// Examples : 
/*********************************************************************** */

const unicorn = filterByKeyValue("unicornProp", "?", animals); // unicorn
const unicorns = filterByKeyValue("isDomestic", false, animals); // unicorn[]
const cat = filterByKeyValue("type", "cat", animals); // cat
const dog = filterByKeyValue("age", 33, animals); // dog
const catAndDog = filterByKeyValue("isDomestic", true, animals); // cat | dog

// Compile error
filterByKeyValue("foo", "?", animals); // '"foo"' is not assignable to parameter of type '"unicornProp" | "catProp" | "dogProp" | "type" | "age" | "isDomestic"'
filterByKeyValue("type", "?", animals); // '"?"' is not assignable to parameter of type '"cat" | "dog" | "unicorn"'
filterByKeyValue("unicornProp", "fdsdf", animals); // '"fdsdf"' is not assignable to parameter of type '"?" | "other"'


/*********************************************************************** */
// Expanded version using javascript recursion to do multiple filtering : 
/*********************************************************************** */


function filterBy<
  TArr extends readonly any[],
  >(arr: TArr) {
    function filterByKeyValue<
      const Key extends GetAllKeys<TArr[number]>,
      const Value extends GetValueByKey<TArr[number], Key>,
    >(key: Key, value: Value) {
      return filterBy(arr.filter((obj): obj is LookUp<TArr[number], Record<Key, Value>> => obj[key] === value))
    }
    
    return {
      filter: filterByKeyValue,
      result: arr
    }
}

/*********************************************************************** */
// Examples : 
/*********************************************************************** */
{
const unicorn = filterBy(animals).filter("type", "unicorn").filter("unicornProp", "other").result // unicorn

// Compile error
const result = filterBy(animals).filter("dogProp", "bark").filter("unicornProp", "other").result 
// '"unicornProp"' is not assignable to parameter of type '"dogProp" | "type" | "age" | "isDomestic"'
}


