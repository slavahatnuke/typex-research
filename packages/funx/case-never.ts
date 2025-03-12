/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/**
 * This function is useful to make sure a switch statement covers all possible values. Ex:
 *
 *   type State = 'created' | 'updated' | 'deleted';
 *
 *   function test(state: State) {
 *     switch (state) {
 *       case 'created':
 *         return console.log('created');
 *
 *       case 'updated':
 *         return console.log('updated');
 *
 *       default:
 *         return caseNever(state);
 *     }
 *   }
 *
 * The previous test function would not compile, as the state parameter would not be
 * never as expected by caseNever, but would be 'deleted' because there is no case
 * in the switch statement to cover for it.
 *
 * @param _
 */
// export const caseNever = (_: never): never => {
//   let value = 'UNKNOWN';
//
//   try {
//     value = JSON.stringify(_);
//   } catch {}
//
//   throw new Error(`caseNever: ${value}`);
// };
