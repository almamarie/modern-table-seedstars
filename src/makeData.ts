import { faker } from "@faker-js/faker";
import { ColumnSort, SortingState } from "@tanstack/react-table";

 const GHANAIAN_CITIES: string[] = [
   "Accra",
   "Kumasi",
   "Tamale",
   "Takoradi",
   "Cape Coast",
   "Ho",
   "Bolgatanga",
   "Wa",
   "Koforidua",
   "Sunyani",
 ];
 export type Person = {
   id: number;
   name: string;
   age: number;
   visits: number;
   applicationDate: Date;
   city: (typeof GHANAIAN_CITIES)[number];
   createdAt: string;
   email: string; // contact for follow-up or verification
   status: "pending" | "accepted" | "rejected"; // current state of the application
 };
 const STATUSES = ["pending", "accepted", "rejected"] as const;

 export type PersonApiResponse = {
   data: Person[];
   meta: {
     totalRowCount: number;
   };
 };

 const range = (len: number) => {
   const arr: number[] = [];
   for (let i = 0; i < len; i++) {
     arr.push(i);
   }
   return arr;
 };

 const newPerson = (index: number): Person => {
   const name = faker.person.fullName();
   const createdAt = faker.date
     .anytime()
     .toISOString()
     .replace("T", " ")
     .split(".")[0];
   return {
     id: index + 1,
     name,
     age: faker.number.int(40),
     visits: faker.number.int(1000),
     applicationDate: faker.date.past(),
     createdAt: createdAt,
     city: faker.helpers.shuffle<Person["city"]>(GHANAIAN_CITIES)[0]!,
     email: faker.internet
       .email({
         firstName: name.split(" ")[0],
         lastName: name.split(" ").slice(-1)[0],
       })
       .toLowerCase(),
     status: faker.helpers.arrayElement(STATUSES),
   };
 };

export function makeData(...lens: number[]) {
  const makeDataLevel = (depth = 0): Person[] => {
    const len = lens[depth]!;
    return range(len).map((index): Person => {
      return {
        ...newPerson(index),
        // subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
      };
    });
  };

  return makeDataLevel();
}

const data = makeData(200);

export const fetchData = async (
  start: number,
  size: number,
  sorting: SortingState
) => {
  const dbData = [...data];
  if (sorting.length) {
    const sort = sorting[0] as ColumnSort;
    const { id, desc } = sort as { id: keyof Person; desc: boolean };
    dbData.sort((a, b) => {
      if (desc) {
        return a[id] < b[id] ? 1 : -1;
      }
      return a[id] > b[id] ? 1 : -1;
    });
  }

  //simulate a backend api
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    data: dbData.slice(start, start + size),
    meta: {
      totalRowCount: dbData.length,
    },
  };
};
