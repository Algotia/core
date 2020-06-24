import { format, parseISO } from 'date-fns'

// should probably create an interface for this
const convert = (input: any) => {
  
  const unixString = new Date(parseInt(input))
  const dateString = new Date(input);
  const isoString = parseISO(input);

  let parsedInput: number | Date; 

  if (isoString.valueOf()) {
    parsedInput = isoString;  
  } else if (dateString.valueOf()) {
    parsedInput = dateString;
  } else if (unixString.valueOf()) {
    parsedInput = unixString;
  }

  return format(parsedInput, 'T')

}

export default convert
