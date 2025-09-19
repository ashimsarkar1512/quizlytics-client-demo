import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const useAllQuiz = () => {
  const { data: AllQuiz = [], refetch } = useQuery({
    queryKey: ["customQuiz"],
    queryFn: async () => {
      const res = await axios.get(
        "https://quizlytics-server-gold.vercel.app/allCustomQuiz"
      );
      return res.data;
    },
  });
  return [AllQuiz, refetch];
};

export default useAllQuiz;
