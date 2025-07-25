import { useEffect, useState } from "react";
import api from "../services/api";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AdminPanel = () => {
  const [pendingProofs, setPendingProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.auth.user);

  // 👮 Protect route: only for admin
  if (!user || user.role !== "admin") {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    const fetchPendingProofs = async () => {
      try {
        const res = await api.get("/admin/pending-reviews");
        setPendingProofs(res.data);
      } catch (err) {
        console.error("Failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingProofs();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/approve/${id}`);
      setPendingProofs((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Approve failed", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/admin/reject/${id}`);
      setPendingProofs((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Reject failed", err);
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel - Pending Proofs</h1>

      {pendingProofs.length === 0 ? (
        <p>No pending proofs 🟢</p>
      ) : (
        <div className="grid gap-4">
          {pendingProofs.map((item) => (
            <div
              key={item._id}
              className="p-4 border rounded-lg shadow bg-white"
            >
              <p>
                <strong>User:</strong> {item.user?.name || "Unknown"}
              </p>
              <p>
                <strong>Task:</strong> {item.taskTitle}
              </p>
              <img
                src={item.proofUrl}
                alt="Proof"
                className="w-48 h-48 object-cover mt-2"
              />
              <div className="mt-2 flex gap-2">
                <Button
                  onClick={() => handleApprove(item._id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => handleReject(item._id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
