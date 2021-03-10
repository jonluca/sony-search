import * as React from 'react';
import ta from 'time-ago';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import {isValid, parse} from 'date-fns';

import { PushshiftAPI, SearchSettings } from './api';
import { SearchHelp } from './help';

const isDevMode = (location.hostname === "localhost" || location.hostname === "127.0.0.1");

import ReactGA from 'react-ga';

ReactGA.initialize('UA-171174933-1', {
	titleCase: false,
	debug: isDevMode,
	testMode: isDevMode
});
ReactGA.pageview(window.location.pathname);

interface AppState extends SearchSettings {
  error: string,
  errorTime: Date,
  searching: boolean,
  comments: Array<any>,
  posts: Array<any>,
  lastUrl: string,
  errorStart: boolean,
  errorEnd: boolean,
}

/** Main class for Reddit Search */
export class App extends React.Component<{}, AppState> {
  lastSearch: SearchSettings;
  api: PushshiftAPI;
  updatedHash: boolean;

  constructor(props) {
    super(props);
    this.state = {
      query: "",
      author: "",
      after: "7d",
	  start: "",
	  end: "",
      sortType: "created_utc",
      sort: "desc",
      filter: "",
      threadType: {},
      error: null,
      errorTime: null,
	  errorStart: false,
	  errorEnd: false,
      searching: false,
      comments: null,
      lastUrl: "",
    };
    this.api = new PushshiftAPI();
    this.updatedHash = false;
  }

  loadLocationHash(shouldSearch: boolean = false) {
    let params = hash_accessor.load();
    if (shouldSearch) {
      this.setState(params, this.doSearch);
    } else {
      this.setState(params);
    }
  }

  componentDidMount() {
    // Add hash change event listener
    window.addEventListener("hashchange", e => {
      if (this.updatedHash) {
        this.updatedHash = false;
        return;
      }
      console.log("location.hash changed. loading new params");
      this.loadLocationHash();
    });

    // Check for location hash. Use it if found
    if (window.location.hash) {
      this.loadLocationHash(true);
      console.log("Loaded params from location.hash");
      return;
    }

    // Load stored form data if exists
    let formDataJson = localStorage.getItem("search-form");
    if (formDataJson !== null) {
      let formData: SearchSettings = JSON.parse(formDataJson);
      this.setState(formData);
      console.log("Loaded params from local storage");
    }
  }

  componentDidUpdate() {
    let toSave: SearchSettings = {
      query: this.state.query,
      author: this.state.author,
      after: this.state.after,
	  start: this.state.start,
	  end: this.state.end,
      sortType: this.state.sortType,
      sort: this.state.sort,
      filter: this.state.filter
    };
    localStorage.setItem("search-form", JSON.stringify(toSave));
  }

  isDateValid = (date: string) => {
	  return isValid(parse(date, "M/d/y", new Date()));
  }

  setError = (error: string) => {
    this.setState({ error: error, errorTime: new Date() });
  }

  handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ query: e.target.value });
  }

  handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ author: e.target.value });
  }

  handleAfterDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let tempState = { after: e.target.value };
	if (e.target.value !== "") {
		tempState.errorStart = false;
		tempState.errorEnd = false;
		tempState.start = "";
		tempState.end = "";
	}
	this.setState(tempState);
  }

  handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	let tempState = {start: e.target.value};
  	if (this.state.errorStart && this.isDateValid(e.target.value)) {
      tempState.errorStart = false;
    }
  	this.setState(tempState);
  }

  handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let tempState = {end: e.target.value};
	if (this.state.errorEnd && this.isDateValid(e.target.value)) {
  	  tempState.errorEnd = false;
  	}
	this.setState(tempState);
  }

  validateStartDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ errorStart: !this.isDateValid(e.target.value) });
  }

  validateEndDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ errorEnd: !this.isDateValid(e.target.value) });
  }

  handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ sortType: e.target.value });
  }

  handleSortDirectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ sort: e.target.value });
  }

  handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ filter: e.target.value });
  }

  handleThreadsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	let threadType = this.state.threadType;
	threadType[e.target.value] = e.target.checked;
	if (!isDevMode) {
	  ReactGA.event({
  	    category: 'Filter',
  	    action: e.target.value,
        label: (e.target.checked ? 'Show':'Hide')
	  });
	}
	this.setState({ threadType: threadType });
  }

  handleThreadsOnly = (thread) => {
	let threadType = this.state.threadType;
	for (const key in threadType) {
	  threadType[key] = (key === thread)
	}
	if (!isDevMode) {
	  ReactGA.event({
        category: 'Filter',
      	action: thread,
        label: 'Only'
	  });
	}
	this.setState({ threadType: threadType });
  }

  handleThreadsAll = () => {
	let threadType = this.state.threadType;
  	for (const key in threadType) {
  	  threadType[key] = true
  	}
	if (!isDevMode) {
	  ReactGA.event({
	  	category: 'Filter',
	  	action: 'All',
	    label: 'Show'
      });
	}
  	this.setState({ threadType: threadType });
  }

  doSearch = async () => {
    this.setState({ threadType: {}, error: null, comments: null, posts: null, searching: true });
    this.lastSearch = { ...this.state };

    // Update location.hash
    let toSave = {
      query: this.state.query,
      author: this.state.author,
      after: this.state.after,
	  start: this.state.start,
	  end: this.state.end,
      sortType: this.state.sortType,
      sort: this.state.sort,
      filter: this.state.filter
    };
    this.updatedHash = true;
    hash_accessor.save(toSave);

    // Search
    try {
      let url = this.api.get_url(this.lastSearch);
      this.setState({ lastUrl: url });
      let data = await this.api.query(url);
	  let threadsList = data.data
          .map(c => c.thread)
          .filter((x, i, a) => a.indexOf(x) == i)
          .sort();
	  let threadOptions = Object.fromEntries(
  		threadsList.map(thread => {
			if (thread === "") {
				thread = "None";
			}
			return [thread, true];
		})
	  );
	  for (const [key, value] of Object.entries(toSave)) {
	    if (value !== "" && !isDevMode) {
		  ReactGA.event({
			nonInteraction: true
		    category: 'Search',
			action: key,
			label: value
		  });
	  }
	  if (key === 'query') {
		  const regex = /[\"\'\|\(\)*’&]|(\s\,|\,\s|\+|\s\-|\s\%\s|\s\>\s|\s\<\s|\sor\s|\sOR\s|\sand\s|\sAND\s)/gi;
		  let keywords = value.replace(regex, ' ').replace(/\s\s+/g, ' ').trim().toLowerCase().split(" ");
		  keywords.map(term => {
			if (!isDevMode) {
			  ReactGA.event({
				nonInteraction: true
				category: 'Search',
			    action: 'keyword',
				label: term
			  });
			}
		  })
	  }
	  }
      // Update state with results
      this.setState({ comments: data.data, threadType: threadOptions, searching: false });
	  let resultsPanel = document.getElementById("results-panel");
	  resultsPanel.scrollIntoView();
    } catch (err) {
      this.setState({ searching: false });
      this.setError(String(err));
    }
  }

  /** Handle the main form being submitted */
  searchSubmit = async (e) => {
    // Update state
    e.preventDefault();
    this.doSearch();
  }

  resetSearch = () => {
	  hash_accessor.clear();
	  this.setState({ lastUrl: "", threadType: {}, error: null, comments: null, posts: null, searching: false });
  }

  /** Render the app
   * @return {React.ReactNode} The react node for the app
   */
  render(): React.ReactNode {
    let linkClass = "text-blue-800 hover:text-blue-600";
    let content;
	let facets;
    let resultCount;
    let filterCount;
    let inner;
    if (this.state.comments) {
      let threadsOptions = Object.entries(this.state.threadType)
	  let threadsFilter = threadsOptions.map(([key, value], i) => {
  	    return (
		  <li className="facet flex items-center" key={i}>
	        <label className="inline-block text-black cursor-pointer relative pl-6 pr-2">
			  <span className="absolute left-0 inset-y-0 flex items-center">
			  	<input type="checkbox" value={key} checked={value} onChange={this.handleThreadsChange} />
			  </span>
      	      <span className="text-sm">{key}</span>
            </label>
			<button className="only cursor-pointer text-xs text-blue-600 no-underline hover:underline ml-2 px-1 hidden lg:inline-block"
			        onClick={() => this.handleThreadsOnly(key)}>only</button>
	      </li>
		)
      });
      resultCount = this.state.comments.length;
      let results = this.state.comments.filter(comment => {
		  let selected = Object.keys(this.state.threadType).filter((x) => this.state.threadType[x]);
		  if (comment.thread === "") {
			  return (selected.indexOf("None") >= 0)
		  } else {
			  return (selected.indexOf(comment.thread) >= 0)
		  }
	  );
      filterCount = results.length;
      // Render comments
      inner = results.map((comment) => {
        if (!comment) {
          return;
        }
        let permalink;
        if (comment.permalink) {
          permalink = comment.permalink;
        } else {
          permalink = `/comments/${comment.link_id.split('_')[1]}/_/${comment.id}/`
        }

        let threadBadge;
        if (comment.thread) {
          threadBadge = <div className="bg-blue-600 rounded-full px-3 py-1 text-xs font-semibold text-white">
            {comment.thread}
          </div>
        }

        return (
			<div className="w-full rounded bg-gray-200 shadow px-6 py-4 mb-4 overflow-hidden" key={comment.id}>
				<div className="mb-3 flex">
					<a className={linkClass + " text-lg font-semibold"}
						target="_blank"
						href={`https://www.reddit.com/u/${comment.author}`}>
						{comment.author}
					</a>
					<span className="ml-auto bg-orange-600 rounded-full px-3 py-1 text-xs font-semibold text-white"
							title={`Score: ${comment.score} point${comment.score !== 1 ? 's':''}`}>
						{comment.score}
					</span>
				</div>
				<a href={`https://www.reddit.com${permalink}?context=1`} className="block text-sm leading-5" target="_blank">
		            <ReactMarkdown source={comment.body}
								   linkTarget="_blank"
								   plugins={[gfm]}
								   disallowedTypes={['link']}
								   unwrapDisallowed />
      			</a>
				<div className={`mt-3 flex ${threadBadge ? "justify-between":"justify-end"}`}>
					{threadBadge}
					<a href={`https://www.reddit.com${permalink}?context=1`}
					   className="bg-blue-900 rounded-full px-3 py-1 text-xs font-semibold text-white"
					   target="_blank"
					   title={new Date(comment.created_utc * 1000).toLocaleString()}>
						{ta.ago((comment.created_utc * 1000))}
					</a>
				</div>
	        </div>
		);
      });
	  let allChecked = Object.values(this.state.threadType).every(v => v);
	  let selectAll;
	  if (!allChecked) {
		  selectAll = <button className="ml-auto cursor-pointer text-xs text-blue-600 no-underline hover:underline focus:outline-none hidden lg:block"
		          onClick={this.handleThreadsAll}>
		    Select All
		  </button>
	  }
	  if (Object.keys(this.state.threadType).length > 1) {
		  facets = <div className="mt-8">
		    <div className="flex">
			  <label className="text-gray-700 text-xs font-bold mb-1">Threads Filter</label>
			  {selectAll}
			</div>
			<ul className="py-2 px-3 block w-full bg-gray-200 border border-gray-200 text-gray-700 rounded">
			  {threadsFilter}
			</ul>
		  </div>
	  }
      content = <div id="results-panel" className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b flex px-6 py-2 items-center flex-none">
          <span className="font-bold text-lg">
            Showing {filterCount < resultCount ? `${filterCount} of `: ''}{resultCount} results
		  </span>
        </div>
        <div className="px-6 py-4 flex-1 overflow-y-scroll">
          {inner}
          <div className="text-center font-bold text-lg py-4">
            {resultCount > 0 ? `End of Results`:`No Results Found`}
          </div>
        </div>
      </div>
    } else {
      if (this.state.searching) {
        content = <div id="results-panel" className="px-6 py-4 loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32 mx-auto my-4" />
      } else {
        content = <div id="results-panel" className="flex-1 px-6 py-4 overflow-y-scroll">
          <div>
		  	<p className="text-center">Search r/churning using the <a className={linkClass} href="https://pushshift.io/">pushshift.io API</a>.</p>
		  </div>
		  <SearchHelp />
        </div>
      }
    }
    // Combine everything and return
    return (
      <div className="md:h-screen md:flex">
	    <div className="md:w-2/6 xl:w-1/4 px-6 py-4 bg-blue-200 overflow-y-scroll">
	        <form onSubmit={this.searchSubmit}>
	          <div>
	            <h1 className="text-2xl">
					<button className="w-full text-left" onClick={this.resetSearch}>Churning Search</button>
				</h1>
	          </div>
	          {/* Search Term */}
	          <div className="mt-2">
	            <label className="block text-gray-700 text-xs font-bold mb-1">Search Term</label>
	            <input onChange={this.handleQueryChange}
	                   value={this.state.query}
	                   className="text-sm block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" />
	          </div>
	          {/* Author */}
	          <div className="mt-2">
	            <label className="block text-gray-700 text-xs font-bold mb-1">Author</label>
	            <input onChange={this.handleAuthorChange}
	                   value={this.state.author}
	                   className="text-sm block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" />
	          </div>

	          {/* Time Range */}
	          <div className="mt-2">
	            <label className="block text-gray-700 text-xs font-bold mb-1">Time Range</label>
	            <div className="relative">
	              <select onChange={this.handleAfterDateChange}
	                      value={this.state.after}
	                      className="text-sm block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
	                <option value="1d">1 Day</option>
	                <option value="7d">1 Week</option>
	                <option value="31d">1 Month</option>
	                <option value="90d">3 Months</option>
	                <option value="182d">6 Months</option>
	                <option value="1y">1 Year</option>
					<option value="2y">2 Years</option>
	                <option value="">Custom</option>
	              </select>
	              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
	                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
	              </div>
	            </div>
	          </div>
			  <div className={"mt-2 " + (this.state.after === "" ? 'grid':'hidden') + " grid-cols-2 gap-4"}>
			  	<div className="col-span-1">
				  <label className="block text-gray-700 text-xs font-bold mb-1">Start Date</label>
				  <input onChange={this.handleStartChange}
				         onBlur={this.validateStartDate}
  	                     value={this.state.start}
  	                     className={"text-sm block appearance-none w-full bg-gray-200 border text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white " + (this.state.errorStart ? 'border-red-500':'border-gray-200 focus:border-gray-500')}
						 placeholder="MM/DD/YYYY" />
                  <p className={"text-red-500 text-xs italic mt-2 " + (this.state.errorStart ? 'block':'hidden')}>Enter a valid date</p>
				</div>
				<div className="col-span-1">
				  <label className="block text-gray-700 text-xs font-bold mb-1">End Date</label>
				  <input onChange={this.handleEndChange}
                         onBlur={this.validateEndDate}
						 value={this.state.end}
					     className={"text-sm block appearance-none w-full bg-gray-200 border text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white " + (this.state.errorEnd ? 'border-red-500':'border-gray-200 focus:border-gray-500')}
						 placeholder="MM/DD/YYYY" />
                  <p className={"text-red-500 text-xs italic mt-2 " + (this.state.errorEnd ? 'block':'hidden')}>Enter a valid date</p>
				</div>
			  </div>
			  <div className="mt-2 grid grid-cols-2 gap-4">
			  {/* Sort By */}
			<div className="col-span-1">
			  <label className="block text-gray-700 text-xs font-bold mb-1">Sort By</label>
			  <div className="relative">
				<select onChange={this.handleSortByChange}
						value={this.state.sortType}
						className="text-sm block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
				  <option value="created_utc">Date</option>
				  <option value="score">Score</option>
				</select>
				<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
				  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
				</div>
			  </div>
			</div>
			{/* Sort Direction */}
			<div className="col-span-1">
			  <label className="block text-gray-700 text-xs font-bold mb-1">Sort Order</label>
			  <div className="relative">
				<select onChange={this.handleSortDirectionChange}
						value={this.state.sort}
						className="text-sm block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
				  <option value="desc">{this.state.sortType === "score" ? "Highest":"Newest"}</option>
				  <option value="asc">{this.state.sortType === "score" ? "Lowest":"Oldest"}</option>
				</select>
				<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
				  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
				</div>
			  </div>
			</div>
			  </div>


	          {/* Score */}
	          <div className="mt-2">
	            <label className="block text-gray-700 text-xs font-bold mb-1">Score Filter</label>
	            <input onChange={this.handleFilterChange}
	                   value={this.state.filter}
	                   className="text-sm block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
	                   placeholder="e.g. >10 <100 >100,<900" />
	          </div>
	          {/* Submit Button and Error text */}
	          <button type="submit"
	                  disabled={this.state.searching || this.state.errorStart || this.state.errorEnd}
	                  className={"w-full rounded bg-blue-900 text-white font-bold mt-4 py-2 text-lg " + ((this.state.searching || this.state.errorStart || this.state.errorEnd) ? 'opacity-50 cursor-not-allowed':'hover:bg-blue-700')}>
	            {this.state.searching ? "Searching..." : "Search"}
	          </button>
	          {this.state.error &&
	            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mt-4 rounded relative" role="alert">
	              <div className="font-bold">{this.state.errorTime.toLocaleTimeString()} Error: {this.state.error}</div>
	              <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
	                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
	              </span>
	            </div>
	          }
	        </form>
			{facets}
		</div>
		{content}
      </div>
    );
  }
}

// https://gist.github.com/jokester/4a543ea76dbc5ae1bf05
let hash_accessor = (function (window) {
  return {
    load: function () {
      try {
        // strip ^#
        let json_str_escaped = window.location.hash.slice(1);
        // unescape
        let json_str = decodeURIComponent(json_str_escaped);
        return JSON.parse(json_str);
      } catch (e) {
        return {};
      }
    },
    save: function (obj) {
      // use replace so that previous url does not go into history
      window.location.replace('#' + JSON.stringify(obj, (key, value) => { if (value) return value; }));
    },
	clear: function () {
	  window.location.replace('');
	}
  };
})(window);
