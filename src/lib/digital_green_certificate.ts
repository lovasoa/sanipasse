// Implementation of digital green certificates
import { verify } from 'cosette/build/sign';
import type { Certificate } from './2ddoc';

type DGC = Certificate; // Todo: create a DGC type

export async function parse(doc: string): Promise<DGC> {
	throw new Error('European digital green certificates are not supported yet');
}
