import * as React from 'react';
import ta from 'time-ago';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import {subDays, addDays, format} from 'date-fns';
import ReactGA from 'react-ga';
import LZString from "lz-string";
import {isEmpty} from "underscore";
import {DateRange} from 'react-date-range';
import toast from 'react-hot-toast';

import {PushshiftAPI, SearchSettings, SearchRange} from './api';
import {SearchHelp} from './help';

import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

const isDevMode = (location.hostname !== "garettg.github.io" && location.hostname !== "churning.io");

ReactGA.initialize('UA-171174933-1', {
    titleCase: false,
    debug: isDevMode,
    testMode: isDevMode
});

if (!isDevMode) {
    ReactGA.pageview(window.location.pathname);
}

interface AppState extends SearchSettings {
    error: string,
    searching: boolean,
    comments: Array<any>
}

/** Main class for Reddit Search */
export class App extends React.Component<{}, AppState> {
    lastSearch: SearchSettings;
    lastThreadType: object;
    api: PushshiftAPI;

    constructor(props) {
        super(props);
        this.state = {
            query: "",
            author: "",
            time: "7d",
            selectionRange: {
                startDate: subDays(new Date(), 7),
                endDate: new Date(),
                key: "selection"
            },
            sort: "desc",
            score: "",
            old: false, // whether to use old or www reddit links
            showDate: false,
            threadType: {},
            error: null,
            searching: false,
            comments: null
        };
        this.api = new PushshiftAPI();
    }

    loadSavedState(formData: object = {}, shouldSearch: boolean = false) {
        if (
            !isEmpty(formData)
            &&
            formData.hasOwnProperty("selectionRange")
            &&
            formData.selectionRange.hasOwnProperty("startDate")
            &&
            formData.selectionRange.hasOwnProperty("endDate")
        ) {
            formData.selectionRange.startDate = new Date(formData.selectionRange.startDate);
            formData.selectionRange.endDate = new Date(formData.selectionRange.endDate);

            if (shouldSearch) {
                if (formData.hasOwnProperty("threadType") && !isEmpty(formData.threadType)) {
                    this.lastThreadType = formData.threadType;
                }
                this.setState(formData, this.doSearch);
            } else {
                this.setState(formData);
            }
        }
    }

    componentDidMount() {
        // Check for location hash. Use it if found
        if (window.location.hash) {
            let formData = utils.decompress(window.location.hash.slice(1));
            this.loadSavedState(formData, true);
            console.log("Loaded state from location.hash");
            // Remove hash now that we have the data
            history.replaceState(null, null, ' ');
            return;
        }

        // Load stored form data if exists
        let localStorageData = utils.decompress(localStorage.getItem("churning-search"));
        if (!isEmpty(localStorageData)) {
            this.loadSavedState(localStorageData);
            console.log("Loaded state from local storage");
        }
    }

    componentDidUpdate() {
        let toSave: SearchSettings = {
            query: this.state.query,
            author: this.state.author,
            time: this.state.time,
            selectionRange: this.state.selectionRange,
            sort: this.state.sort,
            score: this.state.score,
            old: this.state.old,
            showDate: this.state.showDate
        };
        localStorage.setItem("churning-search", utils.compress(toSave));
    }

    setError = (error: string) => {
        this.setState({error: error});
        if (!isDevMode) {
            ReactGA.exception({
                description: error,
                fatal: false
            })
        } else {
            console.error("PushshiftAPI Error", "\n", error);
        }
    }

    handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({query: e.target.value});
    }

    handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({author: e.target.value});
    }

    handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        let tempState = {time: e.target.value};
        if (e.target.value !== "") {
            tempState.selectionRange = {
                startDate: subDays(new Date(), 7),
                endDate: new Date(),
                key: "selection"
            }
        }
        this.setState(tempState);
    }

    handleSortDirectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({sort: e.target.value});
    }

    handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({score: e.target.value});
    }

    handleOldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({old: e.target.checked});
    }

    toggleDate = () => {
        this.setState({showDate: !this.state.showDate});
    }

    handleThreadsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let threadType = this.state.threadType;
        threadType[e.target.value] = e.target.checked;
        if (!isDevMode) {
            ReactGA.event({
                category: 'Filter',
                action: e.target.value,
                label: (e.target.checked ? 'Show' : 'Hide')
            });
        }
        this.setState({threadType: threadType});
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
        this.setState({threadType: threadType});
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
        this.setState({threadType: threadType});
    }

    handleOutboundClick = (event) => {
        if (!isDevMode) {
            ReactGA.event({
                category: 'Outbound',
                action: 'Click',
                label: event.target.href
            });
        }
    }

    handleResultClick = (event, comment) => {
        if (!isDevMode) {
            ReactGA.event({
                category: 'Result',
                action: 'Thread',
                label: comment.thread
            });
            ReactGA.event({
                category: 'Result',
                action: 'Author',
                label: comment.author
            });
        }
    }

    handleAuthorClick = (event, comment) => {
        if (!isDevMode) {
            ReactGA.event({
                category: 'Author',
                action: 'Click',
                label: comment.author
            });
        }
    }

    doSearch = async () => {
        this.setState({threadType: {}, error: null, comments: null, searching: true});
        this.lastSearch = {...this.state};
        let threadOptions = {};
        let data1 = [], data2 = [];

        let url1 = this.api.get_url(this.lastSearch, false);
        // let url2 = this.api.get_url(this.lastSearch, true);

        try {
            data1 = await this.api.query(url1);
        } catch (error) {
            this.setError(`Prod: ${String(error)}`);
        }

        /*
        try {
            data2 = await this.api.query(url2);
        } catch (error) {
            this.setError(`Beta: ${String(error)}`);
        }
        */

        let data = Object.values(data1.concat(data2).reduce((r, o) => {
            r[o.id] = o;
            return r;
        }, {})).sort((a, b) => {
            if (this.state.sort === "asc") {
                return a.created_utc - b.created_utc;
            } else {
                return b.created_utc - a.created_utc;
            }
        });

        if (data.length > 0) {
            for (let i = 0, len = data.length; i < len; i++) {
                let permalink = data[i].permalink;
                switch (true) {
                    case /_megathread/.test(permalink):
                        data[i].thread = "Megathread";
                        break;
                    case /(bank_account_bonus_week_|bank_bonus_weekly_)/.test(permalink):
                        data[i].thread = "Bank Account Bonus";
                        break;
                    case /(question_thread_|newbie_question_weekly_|newbie_weekly_question_)/.test(permalink):
                        data[i].thread = "Daily Question";
                        break;
                    case /(discussion_thread_|daily_discussion_)/.test(permalink):
                        data[i].thread = "Daily Discussion";
                        break;
                    case /manufactured_spending_weekly_/.test(permalink):
                        data[i].thread = "Manufactured Spend";
                        break;
                    case /(data_points_central_|data_points_weekly_|dq_thread_)/.test(permalink):
                        data[i].thread = "Data Points";
                        break;
                    case /what_card_should_i_get_/.test(permalink):
                        data[i].thread = "What Card Should I Get";
                        break;
                    case /frustration_friday_/.test(permalink):
                        data[i].thread = "Frustration";
                        break;
                    case /mods_choice_/.test(permalink):
                        data[i].thread = "Mod's Choice";
                        break;
                    case /(weekly_offtopic_thread_|weekly_off_topic_thread_|anything_goes_thread_)/.test(permalink):
                        data[i].thread = "Off Topic";
                        break;
                    case /(trip_report_and_churning_success_|trip_reports_and_churning_success_|storytime_weekly_|trip_report_weekly_)/.test(permalink):
                        data[i].thread = "Trip Report/Success";
                        break;
                    default:
                        data[i].thread = "";
                }
            }

            // Build a list of unique threads and sort
            let threadsList = data.map(c => c.thread).filter((x, i, a) => a.indexOf(x) == i).sort();
            threadsList.map(thread => {
                if (thread === "") {
                    thread = "None";
                }
                if (!isEmpty(this.lastThreadType) && this.lastThreadType.hasOwnProperty(thread)) {
                    threadOptions[thread] = this.lastThreadType[thread];
                } else {
                    threadOptions[thread] = true;
                }
            });
        }

        let toStats = {
            query: this.state.query,
            author: this.state.author,
            after: this.state.time, // keeping same key name even though state key changed
            start: format(this.state.selectionRange.startDate, 'P'),
            end: format(this.state.selectionRange.endDate, 'P'),
            sort: this.state.sort,
            score: this.state.score
        };

        for (const [key, value] of Object.entries(toStats)) {
            if (value !== "" && !isDevMode) {
                ReactGA.event({
                    nonInteraction: true,
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
                            nonInteraction: true,
                            category: 'Search',
                            action: 'keyword',
                            label: term
                        });
                    }
                })
            }
        }
        // Reset the last threadType
        this.lastThreadType = {};
        // Update state with results
        this.setState({comments: data, threadType: threadOptions, searching: false});
        let resultsPanel = document.getElementById("results-panel");
        resultsPanel.scrollIntoView();
    }

    /** Handle the main form being submitted */
    searchSubmit = async (e) => {
        // Update state
        e.preventDefault();
        this.doSearch();
    }

    clearResults = () => {
        this.setState({threadType: {}, error: null, comments: null, searching: false});
    }

    shareResults = () => {
        let {error, searching, comments, old, showDate, ...toShare} = this.state;
        let shareUrl = `${window.location.href}#${utils.compress(toShare)}`;
        let shareInput = document.body.appendChild(document.createElement("input"));
        shareInput.value = shareUrl;
        shareInput.focus();
        shareInput.select();
        document.execCommand('copy');
        shareInput.parentNode.removeChild(shareInput);
        toast.success('Share Link Copied!');
        if (!isDevMode) {
            ReactGA.event({
                category: 'Share',
                action: 'Click',
                label: JSON.stringify(toShare)
            });
        }
    }

    /** Render the app
     * @return {React.ReactNode} The react node for the app
     */
    render(): React.ReactNode {
        let linkClass = "text-blue-700 dark:text-blue-300 hover:text-blue-500 hover:underline";
        let inputProps = {
            "autoComplete": "off",
            "autoCorrect": "off",
            "autoCapitalize": "off",
            "spellCheck": "false"
        }
        let content;
        let facets;
        let resultCount;
        let filterCount;
        let inner;

        const infoText =
            <>
                <p>Maintained by <a href={`https://${this.state.old ? 'old' : 'www'}.reddit.com/user/garettg/`}
                                    className={linkClass + " no-underline hover:underline"}
                                    target="_blank"
                                    onClick={(e) => this.handleOutboundClick(e)}>garettg</a></p>
                <p><a
                    href={`https://${this.state.old ? 'old' : 'www'}.reddit.com/message/compose/?to=garettg&subject=Churning+Search`}
                    target="_blank"
                    className={linkClass + " no-underline hover:underline"}
                    onClick={(e) => this.handleOutboundClick(e)}>PM with comments, suggestions, issues</a></p>
            </>;

        if (this.state.comments) {
            let threadsOptions = Object.entries(this.state.threadType)
            let threadsFilter = threadsOptions.map(([key, value], i) => {
                return (
                    <li className="facet flex items-baseline" key={i}>
                        <label className="inline-block text-black dark:text-white cursor-pointer relative pl-6 pr-1">
                            <span className="absolute left-0 inset-y-0 flex items-center">
                                <input type="checkbox"
                                       value={key}
                                       checked={value}
                                       onChange={this.handleThreadsChange}
                                       className="rounded-md" />
                            </span>
                            <span className="text-sm">{key}</span>
                        </label>
                        <button className={"only cursor-pointer text-sm ml-2 px-1 hidden lg:inline-block " + linkClass}
                                onClick={() => this.handleThreadsOnly(key)}>only
                        </button>
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
            });
            filterCount = results.length;
            // Render comments
            inner = results.map((comment, index) => {
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
                    threadBadge = <div
                        className="bg-blue-600 dark:bg-cyan-600 rounded-full px-3 py-1 text-xs text-white">{comment.thread}</div>;
                }

                let timeAgo = ta.ago((comment.created_utc * 1000));
                let date = format(new Date(comment.created_utc * 1000), "M/d/yy h:mm aaa");
                let timeText = timeAgo;
                let timeTitle = date;
                if (this.state.showDate) {
                    timeText = date;
                    timeTitle = timeAgo;
                }

                return (
                    <div className="w-full rounded-md bg-gray-100 dark:bg-gray-900 shadow p-4 mb-6 overflow-hidden" key={comment.id}>
                        <div className="flex justify-between items-start">
                            <a className={linkClass + " text-lg font-semibold leading-5"}
                               target="_blank"
                               onClick={(e) => this.handleAuthorClick(e, comment)}
                               href={`https://${this.state.old ? 'old' : 'www'}.reddit.com/u/${comment.author}`}>
                                {comment.author}
                            </a>
                            <span className="bg-orange-600 rounded-full px-3 py-1 text-xs text-white"
                                  title={`Score: ${comment.score} point${comment.score !== 1 ? 's' : ''}`}>
                                {comment.score}
                            </span>
                        </div>
                        <a href={`https://${this.state.old ? 'old' : 'www'}.reddit.com${permalink}?context=1`}
                           onClick={(e) => this.handleResultClick(e, comment)}
                           className="block text-sm leading-5 py-4 px-2 reddit-comment" target="_blank">
                            <ReactMarkdown
                                source={comment.body.replace(/^(?:&gt;)/gm, "\n>")}
                                plugins={[gfm]}
                                disallowedTypes={['link']}
                                unwrapDisallowed
                            />
                        </a>
                        <div className={`flex ${threadBadge ? "justify-between" : "justify-end"}`}>
                            {threadBadge}
                            <span
                                className="bg-blue-900 dark:bg-cyan-900 rounded-full px-3 py-1 text-xs text-white cursor-pointer"
                                onClick={this.toggleDate}
                                title={timeTitle}>
                                {timeText}
                            </span>
                        </div>
                    </div>
                );
            });
            let allChecked = Object.values(this.state.threadType).every(v => v);
            let selectAll;
            if (!allChecked) {
                selectAll =
                    <button
                        className="text-xs focus:outline-none hidden lg:block text-blue-700 hover:text-blue-500 dark:text-cyan-500 dark:hover:text-cyan-300 hover:underline"
                        onClick={this.handleThreadsAll}>
                        Select All
                    </button>;
            }
            if (Object.keys(this.state.threadType).length > 1) {
                facets =
                    <div className="mt-8 mb-4">
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-gray-700 dark:text-gray-300 text-xs font-bold ">Threads
                                Filter</label>
                            {selectAll}
                        </div>
                        <ul className="py-2 px-4 block w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md">
                            {threadsFilter}
                        </ul>
                    </div>;
            }
            content =
                <div id="results-panel" className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-black text-gray-700 dark:text-gray-300">
                    <div className="border-b border-gray-200 dark:border-gray-700 flex justify-between items-center px-4 py-2">
                        <span
                            className="font-bold text-lg text-gray-700 dark:text-gray-300">Showing {filterCount < resultCount ? `${filterCount} of ` : ''}{resultCount} results</span>
                        <div className="flex space-x-2 md:space-x-4">
                            <button
                                className="text-xs bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-1 px-2 rounded inline-flex items-center"
                                title="Share Results"
                                onClick={this.shareResults}>
                                <svg className="fill-current w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg"
                                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                                </svg>
                                <span className="hidden md:inline">Share</span>
                            </button>
                            <button
                                className="text-xs bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-1 px-2 rounded inline-flex items-center"
                                title="Clear Results"
                                onClick={this.clearResults}>
                                <svg className="fill-current w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg"
                                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                                <span className="hidden md:inline">Clear</span>
                            </button>
                        </div>
                    </div>
                    <div className="p-4 md:px-6 lg:px-8 flex-1 overflow-y-scroll">
                        {inner}
                        <div className="text-center font-bold text-lg py-4">
                            {resultCount > 0 ? `End of Results` : `No Results Found`}
                        </div>
                        {this.state.error &&
                            <div
                                className="flex items-start bg-red-100 border border-red-400 text-red-700 p-4 mb-4 rounded"
                                role="alert">
                                <svg className="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <div className="font-bold">Error: {this.state.error}</div>
                            </div>
                        }
                        <div className="text-center text-xs py-4">
                            {infoText}
                        </div>
                    </div>
                </div>;
        } else {
            if (this.state.searching) {
                content = <div id="results-panel"
                               className="p-4 mb-8 loader ease-linear rounded-full border-8 border-t-8 border-gray-200 dark:border-gray-800 h-32 w-32 mx-auto my-4"/>
            } else {
                content =
                    <div id="results-panel" className="flex-1 p-4 overflow-y-scroll bg-white dark:bg-black text-gray-700 dark:text-gray-300">
                        <div className="w-full xl:w-3/4 lg:w-5/6 mx-auto">
                            {this.state.error &&
                                <div
                                    className="flex items-start bg-red-100 border border-red-400 text-red-700 p-4 mb-4 rounded"
                                    role="alert">
                                    <svg className="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none"
                                         viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <div className="font-bold">Error: {this.state.error}</div>
                                </div>
                            }
                            <div className="text-center py-4">
                                Search <a href={`https://${this.state.old ? 'old' : 'www'}.reddit.com/r/churning`}
                                          className={linkClass}
                                          onClick={(e) => this.handleOutboundClick(e)}>r/churning</a> using
                                the <a href="https://pushshift.io/" className={linkClass}
                                       onClick={(e) => this.handleOutboundClick(e)}>pushshift.io API</a>, the same
                                source
                                as <a href="https://redditsearch.io/" className={linkClass}
                                      onClick={(e) => this.handleOutboundClick(e)}>redditsearch.io</a>.
                            </div>
                            <SearchHelp/>
                            <div className="text-center text-xs py-4">
                                {infoText}
                            </div>
                        </div>
                    </div>;
            }
        }
        // Combine everything and return
        // old input style = rounded-md block w-full text-sm text-gray-700 bg-gray-100 focus:bg-white border-gray-200 focus:border-blue-800 focus:outline-none
        let textInputClasses = "dark:bg-black text-sm text-gray-700 dark:text-gray-300 mt-1 block w-full rounded-md bg-gray-100 focus:bg-white dark:focus:bg-gray-800 border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-800 dark:focus:border-blue-300 focus:ring focus:ring-blue-800 dark:focus:ring-blue-400 focus:ring-opacity-50"
        return (
            <div className="md:h-screen md:flex bg-white dark:bg-black text-gray-700 dark:text-gray-300">
                <div
                    className="md:w-2/6 xl:w-1/4 p-4 bg-blue-200 dark:bg-gray-900 shadow-lg overflow-y-auto md:flex md:flex-col">
                    <div>
                        <form onSubmit={this.searchSubmit}>
                            <h1 className="text-2xl text-gray-700 dark:text-gray-300 font-mono tracking-tighter">Churning
                                Search</h1>
                            {/* Search Query */}
                            <div className="mt-2">
                                <label className="block text-gray-700 dark:text-gray-300 text-xs font-bold mb-1"
                                       htmlFor="search-query">Search</label>
                                <input onChange={this.handleQueryChange}
                                       id="search-query"
                                       type="search"
                                       value={this.state.query}
                                       className={textInputClasses}
                                       {...inputProps}
                                />
                            </div>
                            {/* Author */}
                            <div className="mt-2">
                                <label className="block text-gray-700 dark:text-gray-300 text-xs font-bold mb-1"
                                       htmlFor="author">Author</label>
                                <input onChange={this.handleAuthorChange}
                                       id="author"
                                       type="search"
                                       value={this.state.author}
                                       className={textInputClasses}
                                       {...inputProps}
                                />
                            </div>
                            {/* Time Range */}
                            <div className="mt-2">
                                <label className="block text-gray-700 dark:text-gray-300 text-xs font-bold mb-1"
                                       htmlFor="time-range">Time Range</label>
                                <div className="relative">
                                    <select onChange={this.handleTimeChange}
                                            id="time-range"
                                            value={this.state.time}
                                            className={textInputClasses}>
                                        {
                                            Object.entries(SearchRange).map(([key, obj], index) => {
                                                return (
                                                    <option value={key} key={index}>{obj.name}</option>
                                                );
                                            })
                                        }
                                        <option value="">Custom</option>
                                    </select>
                                </div>
                            </div>
                            {/* Date Range Picker */}
                            <div className={`mt-2 customize-date-range ${this.state.time === "" ? 'block' : 'hidden'}`}>
                                <DateRange
                                    editableDateInputs={false}
                                    onChange={(item) => this.setState({selectionRange: item.selection})}
                                    moveRangeOnFirstSelection={false}
                                    minDate={new Date(2012, 11, 11, 0, 0, 0, 0)}
                                    maxDate={new Date()}
                                    ranges={[this.state.selectionRange]}
                                    rangeColors={['#3182ce', '#3ecf8e', '#fed14c']}
                                />
                            </div>
                            <div className="mt-2 grid grid-cols-8 gap-3">
                                {/* Sort Direction */}
                                <div className="col-span-3">
                                    <label
                                        className="block text-gray-700 dark:text-gray-300 text-xs font-bold truncate mb-1"
                                        htmlFor="sort-order">Sort By</label>
                                    <div className="relative">
                                        <select onChange={this.handleSortDirectionChange}
                                                id="sort-order"
                                                value={this.state.sort}
                                                className={textInputClasses}>
                                            <option value="desc">Newest</option>
                                            <option value="asc">Oldest</option>
                                        </select>
                                    </div>
                                </div>
                                {/* Score */}
                                <div className="col-span-3">
                                    <label
                                        className="block text-gray-700 dark:text-gray-300 text-xs font-bold truncate mb-1"
                                        htmlFor="min-score"><abbr title="Minimum"
                                                                  className="no-underline">Min</abbr> Score</label>
                                    <input onChange={this.handleScoreChange}
                                           id="min-score"
                                           type="text"
                                           value={this.state.score}
                                           className={textInputClasses}
                                           placeholder="e.g. 1"
                                           {...inputProps}
                                    />
                                </div>
                                {/* Old Reddit Toggle */}
                                <div className="col-span-2">
                                    <label htmlFor="toggle-old" className="block cursor-pointer">
                                        <div
                                            className="text-gray-700 dark:text-gray-300 text-xs font-bold truncate mb-1">Old
                                            Reddit
                                        </div>
                                        <div className="relative mt-4 mx-2">
                                            <input id="toggle-old" type="checkbox" checked={this.state.old}
                                                   onChange={this.handleOldChange} className="sr-only custom-toggle"/>
                                            <div className="w-8 h-3 bg-gray-300 dark:bg-gray-700 rounded-full shadow-inner"/>
                                            <div className="dot absolute w-5 h-5 bg-white dark:bg-black rounded-full shadow -left-1 -top-1 transition"/>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            {/* Submit Button */}
                            <div className="mt-4">
                                <button type="submit"
                                        disabled={this.state.searching || this.state.errorStart || this.state.errorEnd}
                                        className={"w-full rounded-md text-lg px-4 py-2 font-semibold tracking-wider text-white dark:text-gray-200 bg-blue-900 dark:bg-cyan-900 " + ((this.state.searching || this.state.errorStart || this.state.errorEnd) ? 'cursor-not-allowed' : 'hover:bg-blue-700 dark:hover:bg-cyan-700')}>
                                    <span>{this.state.searching ? "Searching..." : "Search"}</span>
                                </button>
                            </div>
                        </form>
                        {facets}
                    </div>
                </div>
                {content}
            </div>
        );
    }
}

let utils = (function (window) {
    return {
        compress: function (obj) {
            try {
                let compressedObj = LZString.compressToEncodedURIComponent(JSON.stringify(obj));
                return compressedObj;
            } catch (e) {
                console.log("utils.compress did not happen", "\n", e, "\n", obj);
                return '';
            }
        },
        decompress: function (string) {
            try {
                let decompressedEscaped = LZString.decompressFromEncodedURIComponent(string);
                let decompressed = decodeURIComponent(decompressedEscaped);
                if (decompressedEscaped) {
                    return JSON.parse(decompressed);
                } else {
                    return {};
                }
            } catch (e) {
                console.log("utils.decompress did not happen", "\n", e, "\n", string);
                return {};
            }
        }
    };
})(window);
