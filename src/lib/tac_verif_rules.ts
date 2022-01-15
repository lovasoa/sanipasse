import type {
	CommonCertificateInfo,
	CommonTestInfo,
	CommonVaccineInfo
} from './common_certificate_info';
import v from '../assets/validity_data.json'; // Constants containing the rules for the verification of the certificate
import { parse as parse_period } from 'tinyduration';
import type { Duration as Period } from 'tinyduration';

const JANSSEN = 'EU/1/20/1525';
const PCR_TESTS = new Set(['943092', '945006', '948455', 'LP6464-4']);
const ANTIGENIC_TESTS = new Set(['945584', 'LP217198-3']);

const VACCINE_BOOSTER_AGE_PERIOD = parse_period(v.vaccineBoosterAgePeriod);


function add_period(date: Date, duration: Period): Date {
	const m = duration.negative ? -1 : 1;
	const d = new Date(date);
	if (duration.years) d.setFullYear(d.getFullYear() + duration.years * m);
	if (duration.months) d.setMonth(d.getMonth() + duration.months * m);
	if (duration.days) d.setDate(d.getDate() + duration.days * m);
	if (duration.hours) d.setHours(d.getHours() + duration.hours * m);
	if (duration.minutes) d.setMinutes(d.getMinutes() + duration.minutes * m);
	if (duration.seconds) d.setSeconds(d.getSeconds() + duration.seconds * m);
	return d;
}

function add_hours(date: Date, hours: number): Date {
	return add_period(date, { hours });
}

function add_days(date: Date, days: number): Date {
	return add_period(date, { days });
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
	const { vaccination_date, prophylactic_agent, doses_expected, doses_received } = vac;
	if (doses_received < doses_expected)
		throw new Error(`Cycle vaccinal incomplet: dose ${doses_received} sur ${doses_expected}`);
	const vaccine: string = prophylactic_agent.toUpperCase().trim();
	if (vaccine === JANSSEN) {
		const start = add_days(vaccination_date, v.vaccineDelayJanssen);
		const end = add_days(vaccination_date, v.vaccineDelayMaxJanssen);
		return new ValidityPeriod(start, end);
	}
	// Date at which the patient will have (or had) the age for a booster shot
	const booster_date = add_period(date_of_birth, VACCINE_BOOSTER_AGE_PERIOD);
	const is_under_age = add_days(vaccination_date, v.vaccineBoosterDelayUnderAge) < booster_date;
	const toggle_date = new Date(v.vaccineBoosterToggleDate);
	const delays = is_under_age
		? [v.vaccineBoosterDelay, v.vaccineBoosterDelayNew]
		: [v.vaccineBoosterDelayUnderAge, v.vaccineBoosterDelayUnderAgeNew];
	const booster_delay = delays[vaccination_date < toggle_date ? 0 : 1];
	const start_days = doses_expected <= 2 ? v.vaccineDelay : booster_delay;
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
		return { invalid: e instanceof Error ? e.message : `${e}` };
	}
}
