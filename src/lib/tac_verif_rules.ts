import type {
	CommonCertificateInfo,
	CommonTestInfo,
	CommonVaccineInfo
} from './common_certificate_info';
import v from '../assets/validity_data.json'; // Constants containing the rules for the verification of the certificate

const JANSSEN = 'EU/1/20/1525';
const PCR_TESTS = new Set(['943092', '945006', '948455', 'LP6464-4']);
const ANTIGENIC_TESTS = new Set(['945584', 'LP217198-3']);

function add_hours(date: Date, hours: number): Date {
	return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function add_days(date: Date, days: number): Date {
	return add_hours(date, days * 24);
}

export class ValidityPeriod {
	start: Date;
	end: Date;
	constructor(start: Date, end: Date) {
		this.start = start;
		this.end = end;
	}
}

function testValidityInterval(test: CommonTestInfo): ValidityPeriod {
	const { test_date, is_negative, is_inconclusive, test_type } = test;
	const is_pcr = PCR_TESTS.has(test_type);
	const is_antigenic = ANTIGENIC_TESTS.has(test_type);
	if (!is_pcr && !is_antigenic) throw new Error(`Type de test inconnu: ${test_type}`);
	const is_positive = !is_negative && !is_inconclusive;

	if (is_negative) {
		const duration = is_pcr ? v.testNegativePcrEndHour : v.testNegativeAntigenicEndHour;
		return new ValidityPeriod(test_date, add_hours(test_date, duration));
	} else if (is_positive) {
		const start_days = is_pcr ? v.testPositivePcrStartDay : v.testPositiveAntigenicStartDay;
		const end_days = is_pcr ? v.testPositivePcrEndDay : v.testPositiveAntigenicEndDay;
		const start = add_days(test_date, start_days);
		const end = add_days(test_date, end_days);
		return new ValidityPeriod(start, end);
	}
	throw new Error('Test non conclusif');
}

function vaccinationValidityInterval(vac: CommonVaccineInfo, date_of_birth: Date): ValidityPeriod {
	const { vaccination_date, prophylactic_agent, doses_expected } = vac;
	const vaccine: string = prophylactic_agent.toUpperCase().trim();
	if (vaccine === JANSSEN) {
		const start = add_days(vaccination_date, v.vaccineDelayJanssen);
		const end = add_days(vaccination_date, v.vaccineDelayMaxJanssen);
		return new ValidityPeriod(start, end);
	}
	// Date at which the patient will have (or had) the age for a booster shot
	const booster_date = add_days(date_of_birth, v.vaccineBoosterAge * 365.25);
	const is_under_age = add_days(vaccination_date, v.vaccineBoosterDelayUnderAge) < booster_date;
	const start_days =
		doses_expected <= 2
			? v.vaccineDelay
			: is_under_age
			? v.vaccineBoosterDelayUnderAge
			: v.vaccineBoosterDelay;
	const start = add_days(vaccination_date, start_days);
	const over_age_max_delay = doses_expected <= 2 ? v.vaccineDelayMax : v.vaccineBoosterDelayMax;
	const over_age_end = add_days(vaccination_date, over_age_max_delay);
	const end = over_age_end < booster_date ? booster_date : over_age_end;
	return new ValidityPeriod(start, end);
}

export function validityInterval(
	cert: CommonCertificateInfo
): ValidityPeriod | { invalid: string } {
	const { type, date_of_birth } = cert;
	try {
		return type === 'test'
			? testValidityInterval(cert)
			: vaccinationValidityInterval(cert, date_of_birth);
	} catch (e) {
		return { invalid: `${e}` };
	}
}
