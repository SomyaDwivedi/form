import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Question, Answer } from "../../types";
import { AnalyticsHeader } from "../analytics/AnalyticsHeader";
import { StatsOverview } from "../analytics/StatsOverview";
import { CategoryChart } from "../analytics/CategoryChart";
import { LevelChart } from "../analytics/LevelChart";
import { ChartContainer } from "../analytics/ChartContainer";
import { Leaderboard } from "../analytics/Leaderboard";
import { ResponsesTable } from "../analytics/ResponsesTable";
import { AnalyticsDebug } from "../analytics/AnalyticsDebug";
import { useAnalyticsData } from "../hooks/useAnalyticsData";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsPageProps {
  fetchAllQuestionsAndAnswers: () => Promise<{
    questions: Question[];
    answers: Answer[];
  }>;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  fetchAllQuestionsAndAnswers,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [recentAnsweredIds, setRecentAnsweredIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const doFetch = async () => {
      setLoading(true);
      setErr(null);

      try {
        const { questions: fetchedQuestions, answers: fetchedAnswers } =
          await fetchAllQuestionsAndAnswers();
        setQuestions(fetchedQuestions);
        setAnswers(fetchedAnswers);

        const sorted = [...fetchedAnswers].sort((a, b) => {
          const t1 = new Date(a.createdAt || "").getTime();
          const t2 = new Date(b.createdAt || "").getTime();
          return t2 - t1;
        });
        const recentIds = new Set(sorted.slice(0, 5).map((a) => a.questionId));
        setRecentAnsweredIds(recentIds);
      } catch (e: any) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };

    doFetch();
  }, [fetchAllQuestionsAndAnswers]);

  // Use the custom hook to process data
  const analyticsData = useAnalyticsData(questions);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <AnalyticsHeader onRefresh={() => fetchAllQuestionsAndAnswers().then(() => {
          /* no-op; actual refresh logic already runs in useEffect */
        })} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-purple-700 text-lg font-medium">
              Loading analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-6 space-y-6">
        <AnalyticsHeader
          onRefresh={() => {
            /* Call doFetch again */
            fetchAllQuestionsAndAnswers().then(() => {
              /* Because useEffect’s dependency array includes fetchAllQuestionsAndAnswers,
                 calling it directly here ensures the data gets reloaded. */
            });
          }}
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <p className="text-lg font-semibold">Error loading analytics</p>
            <p className="text-sm mt-1">{err}</p>
          </div>
          <button
            onClick={() => {
              fetchAllQuestionsAndAnswers().then(() => {
                /* Reload via useEffect dependency */
              });
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <AnalyticsHeader
        onRefresh={() => {
          fetchAllQuestionsAndAnswers().then(() => {
            /* Triggers the same logic as the initial useEffect */
          });
        }}
      />

      <AnalyticsDebug questions={questions} answers={answers} />

      <StatsOverview
        totalResponses={analyticsData.totalResponses}
        totalAnswered={analyticsData.totalAnswered}
        totalSkipped={analyticsData.totalSkipped}
        overallSkipRate={analyticsData.overallSkipRate}
      />

      <ChartContainer>
        <CategoryChart data={analyticsData.categoryChartData} />
        <LevelChart data={analyticsData.levelChartData} />
      </ChartContainer>

      <Leaderboard items={analyticsData.leaderboard} />

      <ResponsesTable
        questions={questions}
        answerCounts={analyticsData.answerCounts}
        skipCounts={analyticsData.skipCounts}
        recentAnsweredIds={recentAnsweredIds}
      />
    </div>
  );
};

export default AnalyticsPage;
