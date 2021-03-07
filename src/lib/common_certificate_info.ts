import type { Certificate2ddoc } from './2ddoc';
import type { DGC } from './digital_green_certificate';

export interface CommonVaccineInfo {
	type: 'vaccination';
	vaccination_date: Date;
	prophylactic_agent: string;
	doses_received: number;
	doses_expected: number;
}

export interface CommonTestInfo {
	type: 'test';
	test_date: Date;
	is_negative: boolean;
	test_type: string;
	/// Set to true if the test did not give a conclusive result.
	is_inconclusive: boolean;
}

export interface AllCommonInfo {
	first_name: string;
	last_name: string;
	date_of_birth: Date;
	code: string;
	/** sha256 fingerprint */
	fingerprint: string;
	source: { format: 'dgc'; cert: DGC } | { format: '2ddoc'; cert: Certificate2ddoc };
}

export type CommonCertificateInfo = AllCommonInfo & (CommonVaccineInfo | CommonTestInfo);
