import { supabase } from '../lib/supabase';

export interface PotentialDuplicate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  matchReason: string[];
}

interface CheckDuplicateParams {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  excludeId?: string;
}

export async function checkForDuplicates(
  params: CheckDuplicateParams
): Promise<PotentialDuplicate[]> {
  const { firstName, lastName, email, phone, excludeId } = params;
  const duplicates: PotentialDuplicate[] = [];

  try {
    let query = supabase
      .from('contacts')
      .select('id, first_name, last_name, email, phone');

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data: contacts, error } = await query;

    if (error) throw error;
    if (!contacts) return [];

    const normalizedFirstName = firstName.toLowerCase().trim();
    const normalizedLastName = lastName.toLowerCase().trim();
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone?.replace(/\D/g, '');

    for (const contact of contacts) {
      const matchReasons: string[] = [];
      const contactFirstName = contact.first_name?.toLowerCase().trim() || '';
      const contactLastName = contact.last_name?.toLowerCase().trim() || '';
      const contactEmail = contact.email?.toLowerCase().trim() || '';
      const contactPhone = contact.phone?.replace(/\D/g, '') || '';

      if (contactEmail && contactEmail === normalizedEmail) {
        matchReasons.push('Same email address');
      }

      if (
        normalizedPhone &&
        contactPhone &&
        (contactPhone === normalizedPhone ||
          contactPhone.slice(-10) === normalizedPhone.slice(-10))
      ) {
        matchReasons.push('Same phone number');
      }

      if (
        contactFirstName === normalizedFirstName &&
        contactLastName === normalizedLastName
      ) {
        if (matchReasons.length === 0) {
          matchReasons.push('Same name');
        }
      }

      if (matchReasons.length > 0) {
        duplicates.push({
          id: contact.id,
          first_name: contact.first_name,
          last_name: contact.last_name,
          email: contact.email,
          phone: contact.phone,
          matchReason: matchReasons,
        });
      }
    }

    return duplicates;
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return [];
  }
}
