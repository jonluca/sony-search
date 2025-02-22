import * as React from "react";

export class SearchHelp extends React.Component {
  render(): React.ReactNode {
    return (
      <table className="table-auto text-sm">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Field</th>
            <th className="px-4 py-2 text-left">Options</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-4 py-2 align-top whitespace-nowrap font-bold border-gray-200 dark:border-gray-700">
              Search
            </td>
            <td className="border px-4 py-2 align-top border-gray-200 dark:border-gray-700">
              <dl>
                <dt className="font-bold">Multiple terms (AND operation)</dt>
                <dd className="pl-4">
                  <p>To find comments that match two different words, seperate using a "+".</p>
                  <p className="italic">Example: sony+alpha</p>
                </dd>
                <dt className="mt-2 font-bold">Multiple terms (OR operation)</dt>
                <dd className="pl-4">
                  <p>To find comments that match either of two different words, seperate using a "|".</p>
                  <p className="italic">Example: 100mm|400mm</p>
                </dd>
                <dt className="mt-2 font-bold">Negation</dt>
                <dd className="pl-4">
                  <p>
                    To find comments that match one word but not another word, use a "-" before the word you wish to
                    exclude.
                  </p>
                  <p className="italic">Example: sony -canon</p>
                </dd>
                <dt className="mt-2 font-bold">Exact Phrase</dt>
                <dd className="pl-4">
                  <p>If you wanted to find an exact phrase, you can put the phrase in quotation marks.</p>
                  <p className="italic">Example: "super telephoto"</p>
                </dd>
                <dt className="mt-2 font-bold">Combinations</dt>
                <dd className="pl-4">
                  <p>
                    You can combine the previous types of operations and group them using parentheses for advanced
                    searching.
                  </p>
                  <p className="italic">Example: (super|telephoto) -nikon</p>
                </dd>
              </dl>
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2 align-top whitespace-nowrap font-bold border-gray-200 dark:border-gray-700">
              Author
            </td>
            <td className="border px-4 py-2 align-top border-gray-200 dark:border-gray-700">
              <p>This parameter will restrict the search to specific Reddit authors.</p>
              <dl>
                <dt className="mt-2 font-bold">Inclusive</dt>
                <dd className="pl-4">
                  <p>
                    To find comments by one author, simply set the value of author to the name. The field is not
                    case-sensitive and allows multiple authors seperated by a comma.
                  </p>
                  <p className="italic">Example: username1,username2</p>
                </dd>
                <dt className="mt-2 font-bold">Exclusive</dt>
                <dd className="pl-4">
                  <p>You can also use this parameter to return comments not made by specific authors.</p>
                  <p className="italic">Example: !username</p>
                </dd>
                <dt className="mt-2 font-bold">Combination</dt>
                <dd className="pl-4">
                  <p>You can combined both inclusive and exclusive by seperating them with a comma.</p>
                  <p className="italic">Example: username1,!username2</p>
                </dd>
              </dl>
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2 align-top whitespace-nowrap font-bold border-gray-200 dark:border-gray-700">
              Time Range
            </td>
            <td className="border px-4 py-2 align-top border-gray-200 dark:border-gray-700">
              <p>
                Select a time range from the dropdown. Options include 1 day, 1 week, 1 month, 3 months, 6 months, 1
                year, 2 year, and Custom. Custom allows a date range to be selected via calendar widget.
              </p>
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2 align-top whitespace-nowrap font-bold border-gray-200 dark:border-gray-700">
              Sort Order
            </td>
            <td className="border px-4 py-2 align-top border-gray-200 dark:border-gray-700">
              <p>Select a sort order by date, options are newest and oldest.</p>
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2 align-top whitespace-nowrap font-bold border-gray-200 dark:border-gray-700">
              Minimum Score
            </td>
            <td className="border px-4 py-2 align-top border-gray-200 dark:border-gray-700">
              <p>
                The score parameter allows you to search for comments with minimum score. (Score is not consistent with
                live data, score is as of time of snapshot)
              </p>
              <p className="italic pl-4">Example: 1</p>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
}
