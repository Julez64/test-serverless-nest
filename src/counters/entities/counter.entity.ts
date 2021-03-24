import { identity } from "rxjs";

export class Counter {
    [key: string]: number

	constructor(id: string, value: number) {
		return { [id]: value }
	}
}
