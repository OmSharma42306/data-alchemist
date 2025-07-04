"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import FileUploader from "./FileUploader"
import DataGrid from "./DataGrid"
import RuleBuilder from "./RuleBuilder"
import PrioritizationPanel from "./PrioritizationPanel"
import ValidationSummary from "./ValidationSummary"
import ExportPanel from "./ExportPanel"
import { Upload, Grid, Settings, BarChart3, Download, AlertTriangle } from "lucide-react"
import NaturalLanguageInput from "./NaturalLanguageInput"
import { Button } from "./ui/button"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { dataState, rulesState } from "@/lib/recoil/atoms"
import { v4 as uuidv4 } from "uuid"

type SuggestedRule = {
  name: string
  description: string
  type: string
  conditions: any
  actions: any
}

export default function DataValidationApp() {
  const [activeTab, setActiveTab] = useState("upload")
  const [suggestedRules, setSuggestedRules] = useState<SuggestedRule[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const data = useRecoilValue(dataState)
  const setRules = useSetRecoilState(rulesState)

  const fetchSuggestedRules = async () => {
    setLoadingSuggestions(true)
    try {
      const res = await fetch("/api/ai-rule-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: data.tasks,
          workers: data.workers,
        }),
      })
      const json = await res.json()
      setSuggestedRules(json.rules || [])
    } catch (err) {
      alert("Failed to fetch rule suggestions.")
    } finally {
      setLoadingSuggestions(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Data Validation & Processing App</h1>
        <p className="text-muted-foreground">
          Upload, validate, and process your CSV/XLSX data with custom rules
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="grid" className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Data Grid
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Validation
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="priority" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Priority
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>File Upload & Parser</CardTitle>
              <CardDescription>Upload your CSV or XLSX files for clients, workers, and tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grid" className="space-y-4">
          <Card>
            <CardContent className="px-4">
              <NaturalLanguageInput pageType={"grid"} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Editable Data Grid</CardTitle>
              <CardDescription>View and edit your data with inline validation</CardDescription>
            </CardHeader>
            <CardContent>
              <DataGrid />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Validation Summary</CardTitle>
              <CardDescription>Review all validation errors and issues</CardDescription>
            </CardHeader>
            <CardContent>
              <ValidationSummary />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardContent className="px-4">
              <NaturalLanguageInput pageType={"rules"} />
            </CardContent>

            <div className="flex items-center gap-3 px-4 pb-4">
              <Button onClick={fetchSuggestedRules} disabled={loadingSuggestions}>
                {loadingSuggestions ? "Loading..." : "Get AI Rule Suggestions"}
              </Button>
              {loadingSuggestions && (
                <svg
                  className="animate-spin h-4 w-4 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                  />
                </svg>
              )}
            </div>
          </Card>

          {suggestedRules.map((rule, idx) => (
            <Card key={idx} className="border p-3 space-y-2">
              <div className="font-semibold">{rule.name}</div>
              <div className="text-sm text-muted-foreground">{rule.description}</div>
              <Button
                size="sm"
                onClick={() => setRules((prev) => [...prev, { id: uuidv4(), ...rule }])}
              >
                ✅ Add to rules
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSuggestedRules((prev) => prev.filter((_, i) => i !== idx))}
              >
                ❌ Dismiss
              </Button>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle>Rule Builder</CardTitle>
              <CardDescription>
                Create custom rules for co-run tasks, load limits, and slot restrictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RuleBuilder />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priority" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prioritization Panel</CardTitle>
              <CardDescription>Set weights and priorities for task scheduling</CardDescription>
            </CardHeader>
            <CardContent>
              <PrioritizationPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>Export cleaned data and rules configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <ExportPanel />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
